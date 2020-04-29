import { Color } from '@material-ui/lab/Alert';
import { Action, createSlice, Dispatch, createAction } from '@reduxjs/toolkit';
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
  activeIndex: number = 0;
  snackbar: Snackbar = {
    enabled: false,
    severity: 'info',
    message: '',
    timeoutMs: 5000,
    queueMessages: new Array<string>(),
  };
}

// createSlice() で actions と reducers を一気に生成
const appSlice = createSlice({
  name: 'app',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: (state) => {
      return {
        ...state,
        isFetching: true,
      };
    },
    loginSuccess: (state, action) => {
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        isFetching: false,
        isError: false,
      };
    },
    failRequest: (state) => {
      return {
        ...state,
        isFetching: false,
        isError: true,
      };
    },
    unauthorized: (state) => {
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state,
      };
    },
    getNotificationSuccess: (state, action) => {
      return {
        ...state,
        isFetching: false,
        notification: action.payload,
      };
    },
    setMyUserId: (state, action) => {
      return {
        ...state,
        myUserID: action.payload,
      };
    },
    setFetchingStatus: (state, action) => {
      return {
        ...state,
        isFetching: action.payload,
      };
    },
    setActiveIndex: (state, action) => {
      return {
        ...state,
        activeIndex: action.payload,
      };
    },
    changeEnabledSnackbar: (state, action) => {
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          enabled: action.payload.enabled,
          severity: action.payload.severity ? action.payload.severity : state.snackbar.severity,
          message: action.payload.message ? action.payload.message : state.snackbar.message,
          timeoutMs: action.payload.timeoutMs !== null ? action.payload.timeoutMs : null,
        },
      };
    },
    enqueueSnackbarMessages: (state, action) => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.push(action.payload);
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages,
        },
      };
    },
    dequeueSnackbarMessages: (state) => {
      const queueMessages = [...state.snackbar.queueMessages];
      queueMessages.shift();
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          queueMessages,
        },
      };
    },
  },
});

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(appSlice.actions.unauthorized());
      break;

    default:
      break;
  }
};

export class AppActionsForAsync {
  static login = createAction(`${appSlice.name}/login`);

  static loginAction = () => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(appSlice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: LOGIN_REQUEST_HEADERS,
          body: JSON.stringify(LOGIN_USER),
        });

        if (res.ok === false) {
          throw new Error();
        }
        const json = await res.json();
        dispatch(appSlice.actions.loginSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(appSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static getNotificationAction = () => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      try {
        const res = await fetch(`${API_URL}/notification`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS,
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        const json = await res.json();
        dispatch(appSlice.actions.getNotificationSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(appSlice.actions.failRequest());
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
        body: JSON.stringify(body),
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return new ApiResponse(null, true);
      }
      console.log('Send healthCheck.');
      return new ApiResponse();
    };
  };
}

export default appSlice;
