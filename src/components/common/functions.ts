import { UserInfo } from '../../define/model';
import store from '../../store/configureStore';
import { sendHeartbeatAction } from '../../actions/app';

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
  updatedUserInfo['id'] = myUserID;
  updatedUserInfo['heartbeat'] = '';
  dispatch(sendHeartbeatAction(updatedUserInfo, myUserID));
};
