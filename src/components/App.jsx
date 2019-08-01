import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading'
import store from '../store/configureStore';
import { loginAction, getUserListAction, updateUserInfoAction } from '../actions/userList';
import { AUTH_REQUEST_HEADERS } from '../define';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const userID = electronStore.get('userID');

    dispatch(loginAction())
      .then(
        () => {
          const statusCode = store.getState().userList.isError.code;
          if (statusCode === 401) {
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
              title: '行き先掲示板',
              type: 'info',
              buttons: ['OK'],
              message: '認証に失敗しました。',
            });
            return;
          }

          // APIリクエストヘッダに認証トークンを設定する
          AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + store.getState().userList.token;

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
                  remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                    title: '行き先掲示板',
                    type: 'info',
                    buttons: ['OK'],
                    message: 'ユーザ情報が存在しません。\n新規ユーザ登録を行います。',
                  });
                  dispatch(showInitialStartupModalActionCreator());
                  return;
                }

                // 登録済みユーザの場合、情報を初期化
                userInfo['status'] = '在席';
                userInfo['destination'] = '';
                userInfo['return'] = '';
                dispatch(updateUserInfoAction(userInfo, userID))
              }
            );
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

  updateInfo = ipcRenderer.on('updateInfo', (event, key, value) => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userList['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    if (userInfoLength === 0 || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    userInfo[key] = value;
    dispatch(updateUserInfoAction(userInfo, userID))
  });

  render() {
    const isFetching = store.getState().userList.isFetching;

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
