import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading'
import store from '../store/configureStore';
import { getUserListAction, updateUserInfoAction } from '../actions/userList';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const userID = electronStore.get('userID');

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (!userID) {
      this._showModal();
      return;
    }

    dispatch(getUserListAction())
      .then(
        () => {
          const userList = store.getState().userList['userList'];
          const userInfo = this._getUserInfo(userList, userID);
          const userInfoLength = Object.keys(userInfo).length;
          const isError = store.getState().userList.isError;

          if (isError.status === false && userInfoLength === 0) {
            remote.dialog.showMessageBox(null, {
              title: '行き先掲示板',
              type: 'info',
              buttons: ['OK'],
              message: 'ユーザ情報が存在しません。\n新規ユーザ登録を行います。',
            });
            dispatch(showInitialStartupModalActionCreator());
            return;
          }

          // 登録済みユーザの場合、状態を「在席」に更新する
          userInfo['status'] = '在席';
          dispatch(updateUserInfoAction(userInfo, userID))
        }
      );
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  }

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList
      .filter(userInfo => {
        return userInfo['id'] === userID;
      })[0];
    return userInfo || {};
  }

  updateStatus = ipcRenderer.on('updateStatus', (event, status) => {
    // アプリ終了時に状態を「退社」に更新する
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userList['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;

    if (userInfoLength === 0) {
      return;
    }

    userInfo['status'] = status;
    dispatch(updateUserInfoAction(userInfo, userID))
  });

  render() {
    const isFetching = store.getState().userList.isFetching

    return (
      <div>
        {electronStore.get('userID') &&
          <div>
            <UserList />
            <MenuButtonGroup />
          </div>
        }
        <InitialStartupModal />
        <Loading isFetching={isFetching} />
      </div>
    );
  }
}

export default App;
