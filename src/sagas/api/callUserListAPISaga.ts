import { ApiResponse, UserInfo, UserInfoForUpdate } from '../../define/model';
import { callAPI, getUserInfo, showMessageBoxSync } from '../../components/common/functions';
import { put, delay, takeEvery } from 'redux-saga/effects';
import { UserListAPI } from '../../api/userListAPI';
import { userListSlice } from '../../modules/userInfo/userListModule';
import { appSlice } from '../../modules/appModule';
import { API_REQUEST_LOWEST_WAIT_TIME_MS, USER_STATUS_INFO, LEAVING_TIME_THRESHOLD_M } from '../../define';
import { initialStartupModalSlice } from '../../modules/initialStartupModalModule';

/**
 * 全ユーザの退社チェック
 * LEAVING_TIME_THRESHOLD_M 以上healthCheckAtが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
const updateLeavingTimeForUserList = (userList: UserInfo[], myUserID: number) => {
  if (!userList) return [];

  const nowDate: Date = new Date();
  for (const userInfo of userList) {
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

  return userList;
};

export const callUserListAPI = {
  deleteUser: function* (userID: number) {
    yield put(userListSlice.actions.startApiRequest());
    const response: ApiResponse = yield callAPI(UserListAPI.deleteUser, userID);
    if (response.getIsError()) {
      yield put(userListSlice.actions.failRequest());
    } else {
      yield put(userListSlice.actions.deleteUserSuccess());
    }
    return response;
  },

  addUser: function* (userInfo: UserInfo) {
    yield put(userListSlice.actions.startApiRequest());
    delete userInfo.id;
    const response: ApiResponse = yield callAPI(UserListAPI.addUser, userInfo);
    if (response.getIsError()) {
      yield put(userListSlice.actions.failRequest());
    } else {
      yield put(userListSlice.actions.addUserSuccess());
    }
    const userID = response.getPayload().id;
    yield put(appSlice.actions.setMyUserId(userID));
    return response;
  },

  getUserList: function* (myUserID: number) {
    yield put(userListSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(UserListAPI.getUserList);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      yield put(userListSlice.actions.failRequest());
    } else {
      yield put(userListSlice.actions.getUserListSuccess(response.getPayload()));
    }

    updateLeavingTimeForUserList(response.getPayload() as UserInfo[], myUserID);

    return response;
  },

  getUserListWithMyUserIDExists: function* (myUserID: number) {
    yield put(userListSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(UserListAPI.getUserList);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      yield put(userListSlice.actions.failRequest());
    } else {
      yield put(userListSlice.actions.getUserListSuccess(response.getPayload()));
    }

    updateLeavingTimeForUserList(response.getPayload() as UserInfo[], myUserID);

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    const userInfo = getUserInfo(response.getPayload(), myUserID);
    if (userInfo === null) {
      showMessageBoxSync('ユーザ情報がサーバ上に存在しないため、ユーザ登録を行います。');
      yield put(appSlice.actions.setMyUserId(-1));
      yield put(initialStartupModalSlice.actions.initializeState());
      yield put(initialStartupModalSlice.actions.showModal(true));
    }
    return response;
  },

  updateUserInfo: function* (userInfo: UserInfoForUpdate, userID: number) {
    yield put(userListSlice.actions.startApiRequest());
    const response: ApiResponse = yield callAPI(UserListAPI.updateUserInfo, userInfo, userID);
    if (response.getIsError()) {
      yield put(userListSlice.actions.failRequest());
    } else {
      yield put(userListSlice.actions.updateUserInfoSuccess());
    }
    return response;
  },
};

export const callUserListAPISaga = Object.entries(callUserListAPI).map((value: [string, any]) => {
  return takeEvery(`${userListSlice.name}/api/${value[0]}`, value[1]);
});
