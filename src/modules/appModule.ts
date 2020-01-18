import { createSlice, Dispatch, Action } from '@reduxjs/toolkit';
import { RequestError, Notification, UserInfo } from '../define/model';
import { API_URL, LOGIN_REQUEST_HEADERS, LOGIN_USER, AUTH_REQUEST_HEADERS } from '../define';

class _initialState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: RequestError = new RequestError();
  myUserID: number = -1;
  notification: Notification = new Notification();
  updateInstallerUrl: string = '';
  isProcessing: boolean = false;
  activeIndex: number = 0;
  isUpdating: boolean = false;
  fileByteSize: number = 0;
  receivedBytes: number = 0;
  downloadProgress: number = 0;
}

// createSlice() で actions と reducers を一気に生成
const app = createSlice({
  name: 'app',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: (state, action) => {
      return {
        ...state,
        isFetching: appIsFetching(action)
      };
    },
    loginSuccess: (state, action) => {
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        isChangeUser: appIsFetching(action),
        isError: appIsError(state.isError, action)
      };
    },
    requestError: (state, action) => {
      return {
        ...state,
        isFetching: appIsFetching(action),
        isError: appIsError(state.isError, action)
      };
    },
    failRequest: (state, action) => {
      return {
        ...state,
        isFetching: appIsFetching(action),
        isError: appIsError(state.isError, action)
      };
    },
    unauthorized: (state, action) => {
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    },
    getNotificationSuccess: (state, action) => {
      return {
        ...state,
        notification: action.payload
      };
    },
    setMyUserId: (state, action) => {
      return {
        ...state,
        myUserID: action.payload
      };
    },
    getS3SignedUrlSuccess: (state, action) => {
      return {
        ...state,
        updateInstallerUrl: action.payload
      };
    },
    setProcessingStatus: (state, action) => {
      return {
        ...state,
        isProcessing: action.payload
      };
    },
    setActiveIndex: (state, action) => {
      return {
        ...state,
        activeIndex: action.payload
      };
    },
    setUpdatingStatus: (state, action) => {
      return {
        ...state,
        isUpdating: action.payload
      };
    },
    setFileByteSize: (state, action) => {
      return {
        ...state,
        fileByteSize: action.payload
      };
    },
    setReceivedBytes: (state, action) => {
      return {
        ...state,
        receivedBytes: action.payload
      };
    },
    setDownloadProgress: (state, action) => {
      return {
        ...state,
        downloadProgress: action.payload
      };
    }
  }
});

const appIsFetching = (action: any) => {
  switch (action.type) {
    case app.actions.startApiRequest:
      return true;
    default:
      return false;
  }
};

const appIsError = (state = new RequestError(), action: any) => {
  switch (action.type) {
    case app.actions.requestError:
      return {
        ...state,
        status: true
      };
    case app.actions.failRequest:
      return {
        ...state,
        status: true
      };
    default:
      return {
        ...state,
        status: false
      };
  }
};

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(app.actions.unauthorized);
      break;

    default:
      break;
  }
};

export class AsyncActions {
  static loginAction = () => {
    return async (dispatch: Dispatch<Action<any>>) => {
      dispatch(app.actions.startApiRequest);
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: LOGIN_REQUEST_HEADERS,
          body: JSON.stringify(LOGIN_USER)
        });

        if (res.ok === false) {
          return dispatch(app.actions.requestError);
        }
        const json = await res.json();
        return dispatch(app.actions.loginSuccess(json));
      } catch (error) {
        return dispatch(app.actions.failRequest);
      }
    };
  };

  static getNotificationAction = () => {
    return async (dispatch: Dispatch<Action<any>>) => {
      try {
        const res = await fetch(`${API_URL}/notification`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          return dispatch(app.actions.requestError);
        }
        const json = await res.json();
        return dispatch(app.actions.getNotificationSuccess(json));
      } catch (error) {
        return dispatch(app.actions.failRequest);
      }
    };
  };

  static sendHeartbeatAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>) => {
      const body = Object.assign({}, userInfo);
      delete body['id'];
      delete body['order'];
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(app.actions.requestError);
      }
      console.log('Send heartbeat.');
      return;
    };
  };

  static getS3SignedUrlAction = (fileName: string) => {
    return async (dispatch: Dispatch<Action<any>>) => {
      try {
        const res = await fetch(`${API_URL}/getS3SignedUrl?fileName=${fileName}`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          return dispatch(app.actions.requestError);
        }
        const json = await res.json();
        return dispatch(app.actions.getS3SignedUrlSuccess(json));
      } catch (error) {
        dispatch(app.actions.failRequest);
      }
    };
  };
}

export default app;
