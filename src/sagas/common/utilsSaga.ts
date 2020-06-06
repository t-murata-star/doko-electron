import moment from 'moment';
import { ApiResponse, UserInfoForUpdate, UserInfo, UpdateUserInfo, GetCurrentTime } from '../../define/model';
import { put, call, all, select, delay } from 'redux-saga/effects';
import { appActions } from '../../actions/appActions';
import {
  MAIN_APP_VERSION,
  RENDERER_APP_VERSION,
  USER_STATUS_INFO,
  ResponseStatusCode,
  API_REQUEST_LOWEST_WAIT_TIME_MS,
} from '../../define';
import { callUserListAPI } from '../api/callUserListAPISaga';
import { userListActions } from '../../actions/userInfo/userListActions';
import { callCompanyInfoAPI } from '../api/callCompanyInfoAPISaga';
import { callAppAPI } from '../api/callAppAPISaga';
import { RootState } from '../../modules';
import { companyInfoActions } from '../../actions/companyInfo/companyInfoActions';

// startTime: Date.now() 実行結果
export const sleepLowestWaitTime = function* (startTime: number) {
  const MS = 0;
  const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
  if (lowestWaitTime > MS) {
    yield delay(lowestWaitTime);
  }
};

/**
 * ユーザ情報のアプリケーションバージョンを更新
 */
export const updateAppVersionForUserInfo = function* (userInfo: UserInfo, myUserId: number) {
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
    yield call(callUserListAPI.updateAppVersion, updatedUserInfo, myUserId);

    // ローカルのstate（userList）を更新する
    yield put(userListActions.updateUserInfoState(myUserId, updatedUserInfoState));
  }
};

/**
 * 全ての社内情報を取得する
 */
export const getAllCompanyInfo = function* () {
  // operatingTime: HH:MM 形式
  const getMomentOperatingTime = (momentServerCurrentTime: moment.Moment, operatingTime: string): moment.Moment => {
    const splitArr = operatingTime.split(':');
    const hour = Number(splitArr[0]);
    const minute = Number(splitArr[1]);
    const momentOperatingTime = momentServerCurrentTime.clone();
    const initTime = 0;
    return momentOperatingTime.hour(hour).minute(minute).second(initTime).millisecond(initTime);
  };

  const processStartTime = Date.now();
  try {
    yield put(appActions.isShowLoadingPopup(true));
    const state: RootState = yield select();

    const getCurrentTimeResponse: ApiResponse<GetCurrentTime> = yield call(callAppAPI.getCurrentTime);
    if (getCurrentTimeResponse.getIsError()) {
      return;
    }

    const startTime = state.appState.appInfo.displayTimeOfCompanyInfo.start;
    const endTime = state.appState.appInfo.displayTimeOfCompanyInfo.end;
    const momentServerCurrentTime = moment(getCurrentTimeResponse.getPayload().currentTime);
    const momentOperatingStartTime = getMomentOperatingTime(momentServerCurrentTime, startTime);
    const momentOperatingEndTime = getMomentOperatingTime(momentServerCurrentTime, endTime);

    if (momentServerCurrentTime.isBefore(momentOperatingStartTime) || momentServerCurrentTime.isAfter(momentOperatingEndTime)) {
      yield put(companyInfoActions.noOperatingTime());
      return;
    }

    yield all([call(callCompanyInfoAPI.getRestroomUsage), call(callCompanyInfoAPI.getOfficeInfo)]);
  } catch (error) {
    console.error(error);
  } finally {
    yield call(sleepLowestWaitTime, processStartTime);
    yield put(appActions.isShowLoadingPopup(false));
  }
};

/**
 * 状態を「在席」に更新する
 */
export const updateStatusForUserInfo = function* (userInfo: UserInfo, myUserId: number) {
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
};

export const callAPI = function* (calledAPI: any, ...args: any) {
  const isAuthenticated = (statusCode: number): boolean => {
    switch (statusCode) {
      case ResponseStatusCode.unauthorized:
        return false;

      default:
        return true;
    }
  };

  yield put(appActions.startFetching());
  try {
    const response: Response = yield call(calledAPI, ...args);

    if (isAuthenticated(response.status) === false) {
      yield put(appActions.unauthorized());
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
    }

    if (response.ok === false) {
      throw new Error(response.statusText);
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
};
