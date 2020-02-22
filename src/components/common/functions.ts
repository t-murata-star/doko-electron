import store from '../../configureStore';
import { APP_NAME, APP_VERSION } from '../../define';
import { UserInfo } from '../../define/model';
import { AsyncActionsApp } from '../../modules/appModule';
const { remote } = window.require('electron');

// ※戻り値の userInfo は userList の参照である事に注意
export const getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter(userInfo => {
    return userInfo.id === userID;
  })[0];
  return userInfo || null;
};

export const sendHealthCheck = (dispatch: any) => {
  const myUserID = store.getState().appState.myUserID;
  const userList = store.getState().userListState.userList;
  const userInfo = getUserInfo(userList, myUserID);

  if (userInfo === null) {
    return;
  }

  const updatedUserInfo: any = {};
  updatedUserInfo.healthCheckAt = '';
  dispatch(AsyncActionsApp.sendHealthCheckAction(updatedUserInfo, myUserID));
};

export const showMessageBoxSync = (message: any, type: 'info' | 'warning' = 'info') => {
  if (APP_VERSION === '3.0.0') {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: APP_NAME,
      type,
      buttons: ['OK'],
      message
    });
  } else {
    remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
      title: APP_NAME,
      type,
      buttons: ['OK'],
      message
    });
  }
};

export const showMessageBoxSyncWithReturnValue = (
  OKButtonText: string,
  cancelButtonText: string,
  message: any,
  type: 'info' | 'warning' = 'info'
): any => {
  if (APP_VERSION === '3.0.0') {
    return remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: APP_NAME,
      type: 'info',
      buttons: [OKButtonText, cancelButtonText],
      message
    });
  } else {
    return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
      title: APP_NAME,
      type: 'info',
      buttons: [OKButtonText, cancelButtonText],
      message
    });
  }
};
