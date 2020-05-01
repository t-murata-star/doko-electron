import { ApiResponse, UserInfo } from '../../define/model';
import { callAPI, callAPIWithoutErrorSnackBar } from '../../components/common/functions';
import { appSlice } from '../../modules/appModule';
import { put, takeEvery } from 'redux-saga/effects';
import { appAPI } from '../../api/appAPI';

export const callAppAPI = {
  login: function* () {
    yield put(appSlice.actions.startApiRequest());
    const response: ApiResponse = yield callAPI(appAPI.login);
    if (response.getIsError()) {
      yield put(appSlice.actions.failRequest());
    } else {
      yield put(appSlice.actions.loginSuccess(response));
    }
    return response;
  },

  getNotification: function* () {
    const response = yield callAPI(appAPI.getNotification);
    if (response.getIsError()) {
      yield put(appSlice.actions.failRequest());
    } else {
      yield put(appSlice.actions.getNotificationSuccess(response));
    }
    return response;
  },

  sendHealthCheck: function* (userInfo: UserInfo, userID: number) {
    const response: ApiResponse = yield callAPIWithoutErrorSnackBar(appAPI.sendHealthCheck, userInfo, userID);
    if (!response.getIsError()) {
      console.log('Send healthCheck.');
    }
    return response;
  },
};

export const callAppAPISaga = Object.entries(callAppAPI).map((value: [string, any]) => {
  return takeEvery(`${appSlice.name}/api/${value[0]}`, value[1]);
});
