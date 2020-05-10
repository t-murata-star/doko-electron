import {
  ApiResponse,
  UserInfo,
  UserInfoForUpdate,
  DeleteUser,
  AddUser,
  GetUserList,
  GetUserListWithMyUserIDExists,
  UpdateUserInfo,
} from '../../define/model';
import { getUserInfo, showMessageBoxSync, showSnackBar } from '../../components/common/utils';
import { put, delay } from 'redux-saga/effects';
import { UserListAPI } from '../../api/userListAPI';
import { API_REQUEST_LOWEST_WAIT_TIME_MS, USER_STATUS_INFO, LEAVING_TIME_THRESHOLD_M } from '../../define';
import { appActions } from '../../actions/appActions';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';
import { userListActions } from '../../actions/userInfo/userListActions';
import { callAPI } from '../common/utils';

/**
 * 全ユーザの退社チェック
 * LEAVING_TIME_THRESHOLD_M 以上healthCheckAtが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
const updateLeavingTimeForUserList = (userList: UserInfo[], myUserID: number) => {
  if (!userList) return [];
  const _userList: UserInfo[] = JSON.parse(JSON.stringify(userList));
  const nowDate: Date = new Date();
  for (const userInfo of _userList) {
    if (userInfo.id === myUserID) {
      continue;
    }
    if ([USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === true) {
      const healthCheckAt: Date = new Date(userInfo.healthCheckAt);
      const diffMin = Math.floor((nowDate.getTime() - healthCheckAt.getTime()) / (1000 * 60));
      if (diffMin >= LEAVING_TIME_THRESHOLD_M) {
        userInfo.status = USER_STATUS_INFO.s02.status;
      }
    }
  }

  return _userList;
};

export const callUserListAPI = {
  deleteUser: function* (userID: number) {
    const response: ApiResponse<DeleteUser> = yield callAPI(UserListAPI.deleteUser, userID);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(userListActions.deleteUserSuccess());
    }
    return response;
  },

  addUser: function* (userInfo: UserInfo) {
    const _userInfo = { ...userInfo };
    delete _userInfo.id;

    const response: ApiResponse<AddUser> = yield callAPI(UserListAPI.addUser, _userInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(userListActions.addUserSuccess());
    }
    return response;
  },

  getUserList: function* (myUserID: number) {
    const startTime = Date.now();
    const response: ApiResponse<GetUserList[]> = yield callAPI(UserListAPI.getUserList);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      const updatedUserList = updateLeavingTimeForUserList(response.getPayload(), myUserID);
      yield put(userListActions.getUserListSuccess(updatedUserList));
    }

    return response;
  },

  getUserListWithMyUserIDExists: function* (myUserID: number) {
    const startTime = Date.now();
    const response: ApiResponse<GetUserListWithMyUserIDExists[]> = yield callAPI(UserListAPI.getUserList);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      const updatedUserList = updateLeavingTimeForUserList(response.getPayload(), myUserID);
      yield put(userListActions.getUserListSuccess(updatedUserList));
    }

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    const userInfo = getUserInfo(response.getPayload(), myUserID);
    if (userInfo === null) {
      showMessageBoxSync('ユーザ情報がサーバ上に存在しないため、ユーザ登録を行います。');
      yield put(appActions.setMyUserId(-1));
      yield put(initialStartupModalActions.initializeState());
      yield put(initialStartupModalActions.showModal(true));
    }
    return response;
  },

  updateUserInfo: function* (userInfo: UserInfoForUpdate, userID: number) {
    const response: ApiResponse<UpdateUserInfo> = yield callAPI(UserListAPI.updateUserInfo, userInfo, userID);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(userListActions.updateUserInfoSuccess());
    }
    return response;
  },
};
