import { createSlice, Dispatch, Action } from '@reduxjs/toolkit';
import { Notification, UserInfo } from '../define/model';
import { API_URL, LOGIN_REQUEST_HEADERS, LOGIN_USER, AUTH_REQUEST_HEADERS } from '../define';

class _initialState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: boolean = false;
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
const slice = createSlice({
  name: 'app',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: state => {
      return {
        ...state,
        isFetching: true
      };
    },
    loginSuccess: (state, action) => {
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        isError: false
      };
    },
    requestError: state => {
      return {
        ...state,
        isFetching: true,
        isError: true
      };
    },
    failRequest: state => {
      return {
        ...state,
        isFetching: true,
        isError: true
      };
    },
    unauthorized: state => {
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

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(slice.actions.unauthorized());
      break;

    default:
      break;
  }
};

export class AsyncActionsApp {
  static loginAction = () => {
    return async (dispatch: Dispatch<Action<any>>) => {
      dispatch(slice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: LOGIN_REQUEST_HEADERS,
          body: JSON.stringify(LOGIN_USER)
        });

        if (res.ok === false) {
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.loginSuccess(json));
      } catch (error) {
        dispatch(slice.actions.failRequest());
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
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.getNotificationSuccess(json));
      } catch (error) {
        dispatch(slice.actions.failRequest());
      }
    };
  };

  static sendHeartbeatAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>) => {
      const body = { ...userInfo };
      delete body['id'];
      delete body['order'];
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(slice.actions.requestError());
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
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.getS3SignedUrlSuccess(json));
      } catch (error) {
        dispatch(slice.actions.failRequest());
      }
    };
  };
}

export default slice;
