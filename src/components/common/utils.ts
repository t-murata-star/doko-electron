import { Color } from '@material-ui/lab/Alert';
import store from '../../configureStore';
import { APP_NAME } from '../../define';
import { UserInfo } from '../../define/model';
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
