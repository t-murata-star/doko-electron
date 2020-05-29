import { ApiResponse, UserInfoForUpdate, UserInfo, UpdateUserInfo } from '../../define/model';
import { put, call } from 'redux-saga/effects';
import { appActions } from '../../actions/appActions';
import { MAIN_APP_VERSION, RENDERER_APP_VERSION, USER_STATUS_INFO } from '../../define';
import { callUserListAPI } from '../api/callUserListAPISaga';
import { userListActions } from '../../actions/userInfo/userListActions';

/**
 * ユーザ情報のアプリケーションバージョンを更新
 */
export function* updateAppVersionForUserInfo(userInfo: UserInfo, myUserId: number) {
  const updatedUserInfo: UserInfoForUpdate = {};
  const updatedUserInfoState: UserInfo = { ...userInfo };
  let needsUpdate = false;

  if (userInfo.mainAppVersion !== MAIN_APP_VERSION) {
    updatedUserInfo.mainAppVersion = MAIN_APP_VERSION;
    updatedUserInfoState.mainAppVersion = updatedUserInfo.mainAppVersion;
    needsUpdate = true;
  }
  if (userInfo.rendererAppVersion !== RENDERER_APP_VERSION) {
    updatedUserInfo.rendererAppVersion = RENDERER_APP_VERSION;
    updatedUserInfoState.rendererAppVersion = updatedUserInfo.rendererAppVersion;
    needsUpdate = true;
  }

  if (needsUpdate) {
    // バージョン更新（更新日時は更新されない）
    yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserId);

    // ローカルのstate（userList）を更新する
    yield put(userListActions.updateUserInfoState(myUserId, updatedUserInfoState));
  }
}

/**
 * 状態を「在席」に更新する
 */
export function* updateStatusForUserInfo(userInfo: UserInfo, myUserId: number) {
  if (
    userInfo.status === USER_STATUS_INFO.s02.status ||
    userInfo.status === USER_STATUS_INFO.s01.status ||
    userInfo.status === USER_STATUS_INFO.s13.status
  ) {
    const updatedUserInfo: UserInfoForUpdate = {};
    const updatedUserInfoState: UserInfo = { ...userInfo };
    updatedUserInfo.status = USER_STATUS_INFO.s01.status;
    updatedUserInfo.name = userInfo.name;

    // ユーザ情報更新
    const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
      callUserListAPI.updateUserInfo,
      updatedUserInfo,
      myUserId
    );

    // ローカルのstate（userList）を更新する
    updatedUserInfoState.status = updatedUserInfo.status;
    updatedUserInfoState.updatedAt = updateUserInfoResponse.getPayload().updatedAt;
    yield put(userListActions.updateUserInfoState(myUserId, updatedUserInfoState));
  }
}

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
