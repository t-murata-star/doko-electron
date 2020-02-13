import store from '../../configureStore';
import { APP_NAME } from '../../define';
import { UserInfo } from '../../define/model';
import { AsyncActionsApp } from '../../modules/appModule';
const { remote } = window.require('electron');

// ※戻り値の userInfo は userList の参照である事に注意
export const getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter(userInfo => {
    return userInfo['id'] === userID;
  })[0];
  return userInfo || null;
};

export const sendHeartbeat = (dispatch: any) => {
  const myUserID = store.getState().appState['myUserID'];
  const userList = store.getState().userListState['userList'];
  const userInfo = getUserInfo(userList, myUserID);

  if (userInfo === null) {
    return;
  }

  const updatedUserInfo: any = {};
  updatedUserInfo['heartbeat'] = '';
  dispatch(AsyncActionsApp.sendHeartbeatAction(updatedUserInfo, myUserID));
};

export const showMessageBoxSync = (message: any, type: 'info' | 'warning' = 'info') => {
  remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type,
    buttons: ['OK'],
    message
  });
};

export const showMessageBoxSyncWithReturnValue = (
  OKButtonText: string,
  cancelButtonText: string,
  message: any,
  type: 'info' | 'warning' = 'info'
): number => {
  return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type: 'info',
    buttons: [OKButtonText, cancelButtonText],
    message
  });
};
