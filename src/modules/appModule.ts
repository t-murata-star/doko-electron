import { Color } from '@material-ui/lab/Alert';
import { Action, createSlice, Dispatch } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS, LOGIN_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { ApiResponse, Notification, UserInfo } from '../define/model';

interface Snackbar {
  enabled: false;
  severity: Color;
  message: string;
  timeoutMs: number | null;
  queueMessages: Array<string>;
}

class _initialState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: boolean = false;
  myUserID: number = -1;
  notification: Notification = new Notification();
  isProcessing: boolean = false;
  activeIndex: number = 0;
  snackbar: Snackbar = {
    enabled: false,
    severity: 'info',
    message: '',
    timeoutMs: 5000,
    queueMessages: new Array<string>()
  };
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
        isFetching: false,
        isError: true
      };
    },
    failRequest: state => {
      return {
        ...state,
        isFetching: false,
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
    changeEnabledSnackbar: (state, action) => {
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          enabled: action.payload[0],
          severity: action.payload[1] ? action.payload[1] : state.snackbar.severity,
          message: action.payload[2] ? action.payload[2] : state.snackbar.message,
          timeoutMs: action.payload[3] !== null ? action.payload[3] : null
        }
      };
    },
    enqueueSnackbarMessages: (state, action) => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.push(action.payload);
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages
        }
      };
    },
    dequeueSnackbarMessages: state => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.shift();
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages
        }
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
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: LOGIN_REQUEST_HEADERS,
          body: JSON.stringify(LOGIN_USER)
        });

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          throw new Error();
        }
        const json = await res.json();
        dispatch(slice.actions.loginSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static getNotificationAction = () => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      try {
        const res = await fetch(`${API_URL}/notification`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          throw new Error();
        }
        const json = await res.json();
        dispatch(slice.actions.getNotificationSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static sendHealthCheckAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      const body = { ...userInfo };
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        dispatch(slice.actions.requestError());
        return new ApiResponse(null, true);
      }
      console.log('Send healthCheck.');
      return new ApiResponse();
    };
  };
}

export default slice;
