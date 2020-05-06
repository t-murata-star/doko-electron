import { Color } from '@material-ui/lab/Alert';
import store from '../../configureStore';
import { APP_NAME } from '../../define';
import { UserInfo, ApiResponse } from '../../define/model';
import { put, call } from 'redux-saga/effects';
import { appActions } from '../../actions/appActions';
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

export const showMessageBoxSync = (message: any, type: 'info' | 'warning' = 'info') => {
  remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type,
    buttons: ['OK'],
    message,
  });
};

export const showMessageBoxSyncWithReturnValue = (
  OKButtonText: string,
  cancelButtonText: string,
  message: any,
  type: 'info' | 'warning' = 'info'
): any => {
  return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type,
    buttons: [OKButtonText, cancelButtonText],
    message,
  });
};

export const showSnackBar = (severity: Color, message: string = '', timeoutMs: number | null = 5000) => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;

  if (appState.snackbar.queueMessages.length > 0) {
    return;
  }

  if (appState.snackbar.enabled) {
    // 現在表示されているsnackbarを破棄して、新しいsnackbarを表示する
    dispatch(appActions.enqueueSnackbarMessages(message));
    dispatch(appActions.changeEnabledSnackbar(false, null, null, null));
  } else {
    dispatch(appActions.changeEnabledSnackbar(true, severity, message, timeoutMs));
  }
};

export const onSnackBarClose = (event: React.SyntheticEvent, reason?: string) => {
  const dispatch: any = store.dispatch;
  // 画面クリックでsnackbarを閉じない
  // if (reason === 'clickaway') {
  //   return;
  // }
  dispatch(appActions.changeEnabledSnackbar(false, null, null, null));
};

export const onSnackBarExited = () => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;
  const queueMessages = [...appState.snackbar.queueMessages];

  if (queueMessages.length > 0) {
    const message = queueMessages.shift() as string;
    dispatch(appActions.dequeueSnackbarMessages());
    dispatch(appActions.changeEnabledSnackbar(true, appState.snackbar.severity, message, null));
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
    return new ApiResponse(payload);
  } catch (error) {
    console.error(error);
    yield put(appActions.failRequest());
    return new ApiResponse(null, true);
  } finally {
    yield put(appActions.endFetching());
  }
}
