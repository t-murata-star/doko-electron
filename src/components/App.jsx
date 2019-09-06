import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel';
import MenuButtonGroup from '../containers/MenuButtonGroupPanel';
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading';
import store from '../store/configureStore';
import {
  loginAction,
  getUserListAction,
  updateUserInfoAction,
  getNotificationAction,
  sendHeartbeatAction,
  returnEmptyUserListAction,
  setUpdatedAtActionCreator
} from '../actions/userList';
import { AUTH_REQUEST_HEADERS, HEARTBEAT_INTERVAL_MS, APP_DOWNLOAD_URL } from '../define';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class App extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    const userID = electronStore.get('userID');

    document.cookie = 'isConnected=true';

    await dispatch(loginAction());

    const statusCode = store.getState().userListState.isError.code;
    if (statusCode === 401) {
      this._showMessageBox('認証に失敗しました。');
      return;
    }

    // APIリクエストヘッダに認証トークンを設定する
    AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + store.getState().userListState.token;

    const isError = store.getState().userListState.isError;
    if (isError.status) {
      return;
    }

    // お知らせチェック
    await dispatch(getNotificationAction());

    const notification = store.getState().userListState.notification;
    const updateNotificationMessage = `新しい行き先掲示板が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`;

    // バージョンチェック
    try {
      const cookies = await remote.session.defaultSession.cookies.get({
        name: 'version'
      });
      if (notification.latestAppVersion !== cookies[0].value) {
        this._showMessageBox(updateNotificationMessage);
        remote.shell.openExternal(APP_DOWNLOAD_URL);
      }
    } catch (error) {
      this._showMessageBox(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL);
    }

    if (notification.targetIDs.includes(userID) && notification.content !== '') {
      this._showMessageBox(notification.content);
    }

    setInterval(this._heartbeat, HEARTBEAT_INTERVAL_MS);

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (!userID) {
      this._showModal();
      return;
    }

    await dispatch(getUserListAction());
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;

    if (isError.status === false && userInfoLength === 0) {
      dispatch(returnEmptyUserListAction());
      this._showMessageBox('ユーザ情報が存在しません。\nユーザ登録を行います。');
      dispatch(showInitialStartupModalActionCreator());
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;

    const cookies = await remote.session.defaultSession.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      updatedUserInfo['version'] = cookies[0].value;
    }

    // 状態が「退社」のユーザのみ、状態を「在席」に変更して情報を初期化
    if (userInfo['status'] === '退社') {
      updatedUserInfo['status'] = '在席';
      updatedUserInfo['destination'] = '';
      updatedUserInfo['return'] = '';
    }

    Object.assign(userInfo, updatedUserInfo);

    await dispatch(updateUserInfoAction(updatedUserInfo, userID));

    // 情報更新(updateUserInfoAction)の結果を元に、更新日時を更新する
    userInfo['updated_at'] = store.getState().userListState.updatedAt;
    dispatch(setUpdatedAtActionCreator(Object.assign([], userList)));

    this._heartbeat();
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  };

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || {};
  };

  _heartbeat = () => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;

    if (userInfoLength === 0) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['heartbeat'] = '';
    dispatch(sendHeartbeatAction(updatedUserInfo, userID));
  };

  updateInfo = ipcRenderer.on('updateInfo', (event, key, value) => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    if (userInfoLength === 0 || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo[key] = value;
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, userID));
  });

  appClose = ipcRenderer.on('appClose', async event => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    if (userInfoLength === 0 || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      ipcRenderer.send('close');
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['status'] = '退社';
    Object.assign(userInfo, updatedUserInfo);
    await dispatch(updateUserInfoAction(updatedUserInfo, userID));
    ipcRenderer.send('close');
  });

  _showMessageBox = message => {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK'],
      message
    });
  };

  render() {
    const isFetching = store.getState().userListState.isFetching;

    return (
      <div>
        {electronStore.get('userID') && (
          <div>
            <UserList />
            <MenuButtonGroup />
          </div>
        )}
        <InitialStartupModal />
        <Loading isFetching={isFetching} />
      </div>
    );
  }
}

export default App;
