import * as AppActions from '../actions/app';
import { RequestError, Notification } from '../define/model';

export class _AppState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: RequestError = new RequestError();
  myUserID: number = -1;
  notification: Notification = new Notification();
  updateInstallerUrl: string = '';
}

function appIsFetching(state = false, action: any) {
  switch (action.type) {
    case AppActions.LOGIN:
      return true;
    case AppActions.CHECK_NOTIFICATION:
      return true;
    case AppActions.GET_S3_SIGNED_URL:
      return true;
    default:
      return false;
  }
}

function appIsError(state = new RequestError(), action: any) {
  switch (action.type) {
    case AppActions.REQUEST_ERROR:
      return {
        ...state,
        status: true,
        code: action.payload.statusCode,
        text: action.payload.statusText
      };
    case AppActions.FAIL_REQUEST:
      return {
        ...state,
        status: true,
        code: null,
        text: action.payload.message
      };
    default:
      return {
        ...state,
        status: false,
        code: null,
        text: ''
      };
  }
}

/**
 * 登録者情報一覧のstateを管理するReducer
 */
export default function userListState(state = new _AppState(), action: any) {
  switch (action.type) {
    case AppActions.LOGIN:
      return {
        ...state,
        isFetching: appIsFetching(state.isFetching, action)
      };
    case AppActions.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.response.token,
        isAuthenticated: true,
        isFetching: appIsFetching(state.isFetching, action),
        isError: appIsError(state.isError, action)
      };
    case AppActions.REQUEST_ERROR:
      return {
        ...state,
        isError: appIsError(state.isError, action),
        isFetching: appIsFetching(state.isFetching, action)
      };
    case AppActions.FAIL_REQUEST:
      return {
        ...state,
        isError: appIsError(state.isError, action),
        isFetching: appIsFetching(state.isFetching, action)
      };
    case AppActions.UNAUTHORIZED:
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    case AppActions.CHECK_NOTIFICATION_SUCCESS:
      return {
        ...state,
        notification: action.notification
      };
    case AppActions.SEND_HEARTBEAT:
      return {
        ...state
      };
    case AppActions.SET_MY_USER_ID:
      return {
        ...state,
        myUserID: action.userID
      };
    case AppActions.GET_S3_SIGNED_URL_SUCCESS:
      return {
        ...state,
        updateInstallerUrl: action.updateInstallerUrl
      };
    default:
      return state;
  }
}
