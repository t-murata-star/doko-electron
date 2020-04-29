import { Color } from '@material-ui/lab/Alert';
import store from '../../configureStore';
import { APP_NAME, APP_VERSION } from '../../define';
import { UserInfo, ApiResponse } from '../../define/model';
import AppModule, { AppActionsForAsync } from '../../modules/appModule';
import { OfficeInfoActionsForAsync } from '../../modules/officeInfo/officeInfoModule';
import appSlice from '../../modules/appModule';
import { put, call, select, cancel } from 'redux-saga/effects';
import { CallAppAPI } from '../../sagas/api/callAppAPISaga';
const { remote } = window.require('electron');

// ※戻り値の userInfo は userList の参照である事に注意
export const getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter((userInfo) => {
    return userInfo.id === userID;
  })[0];
  return userInfo || null;
};

export const sendHealthCheck = () => {
  const dispatch: any = store.dispatch;
  const myUserID = store.getState().appState.myUserID;
  const userList = store.getState().userListState.userList;
  const userInfo = getUserInfo(userList, myUserID);

  if (userInfo === null) {
    return;
  }

  const updatedUserInfo: any = {};
  updatedUserInfo.healthCheckAt = '';
  dispatch(AppActionsForAsync.sendHealthCheckAction(updatedUserInfo, myUserID));
};

export const showMessageBoxSync = (message: any, type: 'info' | 'warning' = 'info') => {
  if (APP_VERSION === '3.0.0') {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: APP_NAME,
      type,
      buttons: ['OK'],
      message,
    });
  } else {
    remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
      title: APP_NAME,
      type,
      buttons: ['OK'],
      message,
    });
  }
};

export const showMessageBoxSyncWithReturnValue = (
  OKButtonText: string,
  cancelButtonText: string,
  message: any,
  type: 'info' | 'warning' = 'info'
): any => {
  if (APP_VERSION === '3.0.0') {
    return remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: APP_NAME,
      type: 'info',
      buttons: [OKButtonText, cancelButtonText],
      message,
    });
  } else {
    return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
      title: APP_NAME,
      type: 'info',
      buttons: [OKButtonText, cancelButtonText],
      message,
    });
  }
};

export const showSnackBar = (severity: Color, message: string = '通信に失敗しました。', timeoutMs: number = 5000) => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;

  if (appState.snackbar.queueMessages.length > 0) {
    return;
  }

  if (appState.snackbar.enabled) {
    // 現在表示されているsnackbarを破棄して、新しいsnackbarを表示する
    dispatch(AppModule.actions.enqueueSnackbarMessages(message));
    dispatch(AppModule.actions.changeEnabledSnackbar({ enabled: false }));
  } else {
    dispatch(AppModule.actions.changeEnabledSnackbar({ enabled: true, severity, message, timeoutMs }));
  }
};

export const onSnackBarClose = (event: React.SyntheticEvent, reason?: string) => {
  const dispatch: any = store.dispatch;
  // 画面クリックでsnackbarを閉じない
  // if (reason === 'clickaway') {
  //   return;
  // }
  dispatch(AppModule.actions.changeEnabledSnackbar({ enabled: false }));
};

export const onSnackBarExited = () => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;
  const queueMessages = [...appState.snackbar.queueMessages];

  if (queueMessages.length > 0) {
    const message = queueMessages.shift();
    dispatch(AppModule.actions.dequeueSnackbarMessages());
    dispatch(AppModule.actions.changeEnabledSnackbar({ enabled: true, severity: appState.snackbar.severity, message }));
  }
};

export const checkResponseError = async (promiseResponse: Promise<ApiResponse>) => {
  const response = await promiseResponse;
  if (response.getIsError()) {
    showSnackBar('error');
  }
  return response;
};

export const getAllOfficeInfo = async () => {
  const dispatch: any = store.dispatch;

  const responses = await Promise.all([
    dispatch(OfficeInfoActionsForAsync.getRestroomUsageAction(350)),
    dispatch(OfficeInfoActionsForAsync.getOfficeInfoAction(350)),
  ]);

  for (const response of responses) {
    if (response.getIsError()) {
      showSnackBar('error');
      break;
    }
  }
};

export const isAuthenticated = (statusCode: number): boolean => {
  switch (statusCode) {
    case 401:
      return false;

    default:
      return true;
  }
};

// 通常のAPIリクエストのために用いる
export function* callAPI(calledAPI: any, ...args: any) {
  try {
    const response: Response = yield call(calledAPI, ...args);
    if (response.ok === false) {
      throw new Error(response.statusText);
    }

    if (isAuthenticated(response.status) === false) {
      yield put(appSlice.actions.unauthorized());
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
    }

    const payload = yield call(response.json.bind(response));
    return new ApiResponse(payload);
  } catch (error) {
    console.log(error);
    showSnackBar('error');
    return new ApiResponse(null, true);
  }
}

// ローディングインジケータや、エラー時にポップアップを表示せずにAPIリクエストを行う
export function* callAPIWithoutErrorSnackBar(calledAPI: any, ...args: any) {
  try {
    const response: Response = yield call(calledAPI, ...args);
    if (response.ok === false) {
      throw new Error(response.statusText);
    }

    if (isAuthenticated(response.status) === false) {
      yield put(appSlice.actions.unauthorized());
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
    }

    const payload = yield call(response.json.bind(response));
    return new ApiResponse(payload);
  } catch (error) {
    console.log(error);
    return new ApiResponse(null, true);
  }
}

// action: ReturnType<typeof AppActionsForAsync.sendHealthCheck>
export function* sendHealthCheckSaga() {
  const state = yield select();
  const myUserID = state.appState.myUserID;
  const userList = state.userListState.userList;
  const userInfo = getUserInfo(userList, myUserID);
  if (userInfo === null) {
    yield cancel();
  }

  const updatedUserInfo: any = {};
  updatedUserInfo.healthCheckAt = '';

  const sendHealthCheckResponse: ApiResponse = yield call(CallAppAPI.sendHealthCheck, updatedUserInfo, myUserID);
  if (sendHealthCheckResponse.getIsError() === false) {
    console.log('Send healthCheck.');
  }
}
