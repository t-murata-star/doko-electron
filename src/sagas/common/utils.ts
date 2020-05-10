import { ApiResponse } from '../../define/model';
import { put, call } from 'redux-saga/effects';
import { appActions } from '../../actions/appActions';

export function* callAPI(calledAPI: any, ...args: any) {
  yield put(appActions.startFetching());
  try {
    const response: Response = yield call(calledAPI, ...args);
    if (response.ok === false) {
      throw new Error(response.statusText);
    }

    if (isAuthenticated(response.status) === false) {
      yield put(appActions.unauthorized());
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
    }

    const payload = yield call(response.json.bind(response));
    yield put(appActions.fetchingSuccess());
    return new ApiResponse(payload, false);
  } catch (error) {
    console.error(error);
    yield put(appActions.failRequest());
    return new ApiResponse(null, true);
  } finally {
    yield put(appActions.endFetching());
  }

  function isAuthenticated(statusCode: number): boolean {
    switch (statusCode) {
      case 401:
        return false;

      default:
        return true;
    }
  }
}
