import {
  ApiResponse,
  UserInfo,
  UserInfoForUpdate,
  DeleteUser,
  AddUser,
  GetUserList,
  GetUserListWithMyUserIdExists,
  UpdateUserInfo,
} from '../../define/model';
import { getUserInfo, showMessageBoxSync, showSnackBar } from '../../components/common/utils';
import { put, delay } from 'redux-saga/effects';
import { UserListAPI } from '../../api/userListAPI';
import { API_REQUEST_LOWEST_WAIT_TIME_MS, USER_STATUS_INFO, LEAVING_TIME_THRESHOLD_M, NO_USER } from '../../define';
import { appActions } from '../../actions/appActions';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';
import { userListActions } from '../../actions/userInfo/userListActions';
import { callAPI } from '../common/utilsSaga';

/**
 * 全ユーザの退社チェック
 * LEAVING_TIME_THRESHOLD_M 以上healthCheckAtが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
const updateLeavingTimeForUserList = (userList: UserInfo[], myUserId: number) => {
  if (!userList) {
    return [];
  }
  const _userList: UserInfo[] = JSON.parse(JSON.stringify(userList));
  const nowDate: Date = new Date();
  for (const userInfo of _userList) {
    if (userInfo.id === myUserId) {
      continue;
    }
    if ([USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === true) {
      const healthCheckAt: Date = new Date(userInfo.healthCheckAt);
      const msec = 1000;
      const sec = 60;
      const diffMin = Math.floor((nowDate.getTime() - healthCheckAt.getTime()) / (msec * sec));
      if (diffMin >= LEAVING_TIME_THRESHOLD_M) {
        userInfo.status = USER_STATUS_INFO.s02.status;
      }
    }
  }

  return _userList;
};

export const callUserListAPI = {
  deleteUser: function* (userId: number) {
    const response: ApiResponse<DeleteUser> = yield callAPI(UserListAPI.deleteUser, userId);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(userListActions.deleteUserSuccess());
    return response;
  },

  addUser: function* (userInfo: UserInfo) {
    const _userInfo = { ...userInfo };
    delete _userInfo.id;

    const response: ApiResponse<AddUser> = yield callAPI(UserListAPI.addUser, _userInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(userListActions.addUserSuccess());
    return response;
  },

  getUserList: function* (myUserId: number) {
    const startTime = Date.now();
    const response: ApiResponse<GetUserList[]> = yield callAPI(UserListAPI.getUserList);
    const MS = 0;

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (lowestWaitTime > MS) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    const updatedUserList = updateLeavingTimeForUserList(response.getPayload(), myUserId);
    yield put(userListActions.getUserListSuccess(updatedUserList));
    return response;
  },

  getUserListWithMyUserIdExists: function* (myUserId: number) {
    const startTime = Date.now();
    const response: ApiResponse<GetUserListWithMyUserIdExists[]> = yield callAPI(UserListAPI.getUserList);
    const MS = 0;

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (lowestWaitTime > MS) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    const updatedUserList = updateLeavingTimeForUserList(response.getPayload(), myUserId);
    yield put(userListActions.getUserListSuccess(updatedUserList));

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    const userInfo = getUserInfo(response.getPayload(), myUserId);
    if (userInfo === null) {
      showMessageBoxSync('ユーザ情報がサーバに存在しないため、ユーザ登録を行います。');
      yield put(appActions.setMyUserId(NO_USER));
      yield put(initialStartupModalActions.initializeState());
      yield put(initialStartupModalActions.showModal(true));
    }

    return response;
  },

  updateUserInfo: function* (userInfo: UserInfoForUpdate, userId: number) {
    const response: ApiResponse<UpdateUserInfo> = yield callAPI(UserListAPI.updateUserInfo, userInfo, userId);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(userListActions.updateUserInfoSuccess());
    return response;
  },
};
