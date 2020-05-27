import { Color } from '@material-ui/lab/Alert';
import store from '../../configureStore';
import {
  APP_NAME,
  MAIN_APP_VERSION,
  HEALTH_CHECK_INTERVAL_MS,
  VERSION_CHECK_INTERVAL_MS,
  RENDERER_APP_VERSION,
} from '../../define';
import { UserInfo } from '../../define/model';
import { appActions, appActionsAsyncLogic } from '../../actions/appActions';
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

export const getUserListIndexBasedOnUserID = (userList: UserInfo[], userID: number): number => {
  if (!userList) {
    return -1;
  }
  const userInfo = userList.filter((userInfo) => {
    return userInfo.id === userID;
  })[0];

  return userList.indexOf(userInfo);
};

export const showMessageBoxSync = (message: string, type: 'info' | 'warning' = 'info') => {
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
  message: string,
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

export const onSnackBarClose = () => {
  const dispatch: any = store.dispatch;
  // ※いつか使うかもしれない & 分からなくなりそうなのであえて残しておく
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

export const isLatestMainVersion = (latestVersion: string): boolean => {
  return latestVersion === MAIN_APP_VERSION;
};

export const isLatestRendererVersion = (latestVersion: string): boolean => {
  return latestVersion === RENDERER_APP_VERSION;
};

export const regularExecution = () => {
  const dispatch: any = store.dispatch;

  setInterval(() => {
    const regularExecutionEnabled = store.getState().appState.regularExecutionEnabled;
    if (regularExecutionEnabled.sendHealthCheck) {
      dispatch(appActionsAsyncLogic.sendHealthCheck());
    }
  }, HEALTH_CHECK_INTERVAL_MS);

  setInterval(() => {
    const regularExecutionEnabled = store.getState().appState.regularExecutionEnabled;
    if (regularExecutionEnabled.checkVersion) {
      dispatch(appActionsAsyncLogic.checkVersion());
    }
  }, VERSION_CHECK_INTERVAL_MS);
};
