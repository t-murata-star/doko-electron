import { createAction } from '@reduxjs/toolkit';
import { AppInfo, Login } from '../define/model';
import { Color } from '@material-ui/lab/Alert';

export const appActions = {
  startFetching: createAction(`app/startFetching`),
  endFetching: createAction(`app/endFetching`),
  fetchingSuccess: createAction(`app/fetchingSuccess`),
  failRequest: createAction(`app/failRequest`),
  loginSuccess: createAction(`app/loginSuccess`, (response: Login) => {
    return {
      payload: {
        token: response.token,
      },
    };
  }),
  unauthorized: createAction(`app/unauthorized`),
  getAppInfoSuccess: createAction(`app/getAppInfoSuccess`, (appInfo: AppInfo) => {
    return {
      payload: {
        appInfo,
      },
    };
  }),
  setMyUserId: createAction(`app/setMyUserId`, (myUserID: number) => {
    return {
      payload: {
        myUserID,
      },
    };
  }),
  setActiveIndex: createAction(`app/setActiveIndex`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
  changeEnabledSnackbar: createAction(
    `changeEnabledSnackbar`,
    (enabled: boolean, severity: Color | null, message: string | null, timeoutMs: number | null) => {
      return {
        payload: {
          enabled,
          severity,
          message,
          timeoutMs,
        },
      };
    }
  ),
  enqueueSnackbarMessages: createAction(`app/enqueueSnackbarMessages`, (message: string) => {
    return {
      payload: {
        message,
      },
    };
  }),
  dequeueSnackbarMessages: createAction(`app/dequeueSnackbarMessages`),
  isShowLoadingPopup: createAction(`app/isShowLoadingPopup`, (isShowLoadingPopup: boolean) => {
    return {
      payload: {
        isShowLoadingPopup,
      },
    };
  }),
  regularSendHealthCheckEnabled: createAction(`app/regularSendHealthCheckEnabled`, (enabled: boolean) => {
    return {
      payload: {
        enabled,
      },
    };
  }),
  regularCheckVersionEnabled: createAction(`app/regularCheckVersionEnabled`, (enabled: boolean) => {
    return {
      payload: {
        enabled,
      },
    };
  }),
};

export const appActionsAsyncLogic = {
  login: createAction(`app/logic/login`),
  sendHealthCheck: createAction(`app/logic/sendHealthCheck`),
  checkVersion: createAction(`app/logic/checkVersion`),
  clickTabbar: createAction(`app/logic/clickTabbar`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
};
