import { ApiResponse, Login, GetAppInfo } from '../../define/model';
import { showSnackBar } from '../../components/common/utils';
import { put } from 'redux-saga/effects';
import { appAPI } from '../../api/appAPI';
import { appActions } from '../../actions/appActions';
import { callAPI } from '../common/utilsSaga';

export const callAppAPI = {
  login: function* () {
    const response: ApiResponse<Login> = yield callAPI(appAPI.login);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(appActions.loginSuccess(response.getPayload()));
    return response;
  },

  getAppInfo: function* () {
    const response: ApiResponse<GetAppInfo> = yield callAPI(appAPI.getAppInfo);
    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
      return response;
    }

    yield put(appActions.getAppInfoSuccess(response.getPayload()));
    return response;
  },
};
