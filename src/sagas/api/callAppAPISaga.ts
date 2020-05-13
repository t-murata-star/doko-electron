import { ApiResponse, Login, GetAppInfo, SendHealthCheck } from '../../define/model';
import { getUserInfo, showSnackBar } from '../../components/common/utils';
import { put, select } from 'redux-saga/effects';
import { appAPI } from '../../api/appAPI';
import { appActions } from '../../actions/appActions';
import { callAPI } from '../common/utilsSaga';

export const callAppAPI = {
  login: function* () {
    const response: ApiResponse<Login> = yield callAPI(appAPI.login);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    } else {
      yield put(appActions.loginSuccess(response.getPayload()));
    }
    return response;
  },

  getAppInfo: function* () {
    const response: ApiResponse<GetAppInfo> = yield callAPI(appAPI.getAppInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    } else {
      yield put(appActions.getAppInfoSuccess(response.getPayload()));
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

    const response: ApiResponse<SendHealthCheck> = yield callAPI(appAPI.sendHealthCheck, updatedUserInfo, myUserID);
    if (!response.getIsError()) {
      console.log('Send healthCheck.');
    }
    return response;
  },
};
