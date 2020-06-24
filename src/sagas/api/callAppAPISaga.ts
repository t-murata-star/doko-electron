import { ApiResponse, Login, GetAppInfo, GetCurrentTime } from '../../define/model';
import { showSnackBar } from '../../components/common/utils';
import { put } from 'redux-saga/effects';
import { appAPI } from '../../api/appAPI';
import { appActions } from '../../actions/appActions';
import { callAPI } from '../common/utilsSaga';

export const callAppAPI = {
  // ログイン(認証トークンを取得)
  login: function* () {
    const response: ApiResponse<Login> = yield callAPI(appAPI.login);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(appActions.loginSuccess(response.getPayload()));
    return response;
  },

  // アプリ情報を取得
  getAppInfo: function* () {
    const response: ApiResponse<GetAppInfo> = yield callAPI(appAPI.getAppInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(appActions.getAppInfoSuccess(response.getPayload()));
    return response;
  },

  // 現在日時をサーバから取得
  getCurrentTime: function* () {
    const response: ApiResponse<GetCurrentTime> = yield callAPI(appAPI.getCurrentTime);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(appActions.getCurrentTimeSuccess());
    return response;
  },
};
