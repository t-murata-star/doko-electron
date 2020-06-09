import { createAction } from '@reduxjs/toolkit';
import { AppInfo, Login } from '../define/model';
import { Color } from '@material-ui/lab/Alert';

export const appActions = {
  // APIリクエスト処理中
  startFetching: createAction(`app/startFetching`),
  // APIリクエスト処理完了
  endFetching: createAction(`app/endFetching`),
  // APIリクエスト処理成功
  fetchingSuccess: createAction(`app/fetchingSuccess`),
  // APIリクエスト処理失敗
  failRequest: createAction(`app/failRequest`),
  // ログイン成功(認証トークンを設定)
  loginSuccess: createAction(`app/loginSuccess`, (response: Login) => {
    return {
      payload: {
        token: response.token,
      },
    };
  }),
  // ログイン失敗
  unauthorized: createAction(`app/unauthorized`),
  // 現在日時取得成功
  getCurrentTimeSuccess: createAction(`app/getCurrentTimeSuccess`),
  // アプリ情報取得成功
  getAppInfoSuccess: createAction(`app/getAppInfoSuccess`, (appInfo: AppInfo) => {
    return {
      payload: {
        appInfo,
      },
    };
  }),
  // アプリ使用者のユーザIDを設定
  setMyUserId: createAction(`app/setMyUserId`, (myUserId: number) => {
    return {
      payload: {
        myUserId,
      },
    };
  }),
  // 現在選択中のタブ番号を設定
  setActiveIndex: createAction(`app/setActiveIndex`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
  // snackbarの有効/無効設定
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
  // snackbarに表示するメッセージをenqueue
  enqueueSnackbarMessages: createAction(`app/enqueueSnackbarMessages`, (message: string) => {
    return {
      payload: {
        message,
      },
    };
  }),
  // snackbarに表示するメッセージをdequeue
  dequeueSnackbarMessages: createAction(`app/dequeueSnackbarMessages`),
  // ローディングインジケータ表示/非表示設定
  isShowLoadingPopup: createAction(`app/isShowLoadingPopup`, (isShowLoadingPopup: boolean) => {
    return {
      payload: {
        isShowLoadingPopup,
      },
    };
  }),
  // ヘルスチェック定期実行の有効/無効
  regularSendHealthCheckEnabled: createAction(`app/regularSendHealthCheckEnabled`, (enabled: boolean) => {
    return {
      payload: {
        enabled,
      },
    };
  }),
  // バージョンチェック定期実行の有効/無効
  regularCheckUpdatableEnabled: createAction(`app/regularCheckUpdatableEnabled`, (enabled: boolean) => {
    return {
      payload: {
        enabled,
      },
    };
  }),
};

export const appActionsAsyncLogic = {
  // アプリ起動時のログイン処理
  login: createAction(`app/logic/login`),
  // ヘルスチェック送信処理
  sendHealthCheck: createAction(`app/logic/sendHealthCheck`),
  // バージョンチェック処理
  regularCheckUpdatable: createAction(`app/logic/regularCheckUpdatable`),
  // タブをクリックした際の処理
  clickTabbar: createAction(`app/logic/clickTabbar`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
};
