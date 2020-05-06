import { ApiResponse } from '../../define/model';
import { callAPI, getUserInfo, showSnackBar } from '../../components/common/functions';
import { put, select } from 'redux-saga/effects';
import { appAPI } from '../../api/appAPI';
import { appActions } from '../../actions/appActions';

export const callAppAPI = {
  login: function* () {
    const response: ApiResponse = yield callAPI(appAPI.login);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(appActions.loginSuccess(response.getPayload()));
    }
    return response;
  },

  getNotification: function* () {
    const response: ApiResponse = yield callAPI(appAPI.getNotification);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(appActions.getNotificationSuccess(response.getPayload()));
    }
    return response;
  },

  sendHealthCheck: function* () {
    const state = yield select();
    const myUserID = state.appState.myUserID;
    const userList = state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo.healthCheckAt = '';

    const response: ApiResponse = yield callAPI(appAPI.sendHealthCheck, updatedUserInfo, myUserID);
    if (!response.getIsError()) {
      console.log('Send healthCheck.');
    }
    return response;
  },
};
