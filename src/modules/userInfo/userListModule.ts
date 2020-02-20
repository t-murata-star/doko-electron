import { Action, createSlice, Dispatch } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS, LEAVING_TIME_THRESHOLD_M, USER_STATUS_INFO, APP_NAME } from '../../define';
import { ApiResponse, UserInfo } from '../../define/model';
import AppModule from '../appModule';
import InitialStartupModalModule from '../initialStartupModalModule';
const { remote } = window.require('electron');

class _initialState {
  userList: UserInfo[] = [];
  isFetching: boolean = false;
  isError: boolean = false;
  selectedUserId: number = -1; // ユーザ一覧画面で編集中のユーザのIDを格納する
  inoperable: boolean = false;
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'userList',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: state => {
      return {
        ...state,
        isFetching: true
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
    getUserListSuccess: (state, action) => {
      return {
        ...state,
        userList: updateLeavingTimeForUserList(action.payload[0], action.payload[1]),
        isFetching: false,
        isError: false
      };
    },
    updateUserInfoSuccess: state => {
      return {
        ...state,
        isFetching: false,
        isError: false
      };
    },
    changeOrderSuccess: state => {
      return {
        ...state,
        isFetching: false,
        isError: false
      };
    },
    addUserSuccess: (state, action) => {
      return {
        ...state,
        isFetching: false,
        isError: false
      };
    },
    deleteUserSuccess: state => {
      return {
        ...state,
        isFetching: false,
        isError: false
      };
    },
    updateForAddedUserInfoSuccess: state => {
      return {
        ...state,
        isFetching: false,
        isError: false
      };
    },
    selectUser: (state, action) => {
      return {
        ...state,
        selectedUserId: action.payload
      };
    },
    returnEmptyUserList: state => {
      return {
        ...state,
        userList: []
      };
    },
    inoperable: (state, action) => {
      return {
        ...state,
        inoperable: action.payload
      };
    },
    setUserInfo: (state, action) => {
      return {
        ...state,
        userList: action.payload
      };
    }
  }
});

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(AppModule.actions.unauthorized());
      break;

    default:
      break;
  }
};

/**
 * 全ユーザの退社チェック
 * LEAVING_TIME_THRESHOLD_M 以上healthCheckAtが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
const updateLeavingTimeForUserList = (userList: UserInfo[], myUserID: number) => {
  if (!userList) return [];

  const nowDate: Date = new Date();
  for (const userInfo of userList) {
    if (userInfo.id === myUserID) {
      continue;
    }
    if ([USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo['status']) === true) {
      const healthCheckAt: Date = new Date(userInfo['healthCheckAt']);
      const diffMin = Math.floor((nowDate.getTime() - healthCheckAt.getTime()) / (1000 * 60));
      if (diffMin >= LEAVING_TIME_THRESHOLD_M) {
        userInfo['status'] = USER_STATUS_INFO.s02.status;
        // 更新日時を最後のhealthCheckAt送信日時に設定する
        userInfo['updatedAt'] = userInfo['healthCheckAt'];
      }
    }
  }

  return userList;
};

// スリープ処理
const _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export class AsyncActionsUserList {
  static deleteUserAction = (userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/userList/${userID}`, {
          method: 'DELETE',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        dispatch(slice.actions.deleteUserSuccess());
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static addUserAction = (userInfo: UserInfo) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      const body = { ...userInfo };
      delete body['id'];
      try {
        const res = await fetch(`${API_URL}/userList`, {
          method: 'POST',
          headers: AUTH_REQUEST_HEADERS,
          body: JSON.stringify(body)
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json: UserInfo = await res.json();
        const userID = json.id;
        dispatch(AppModule.actions.setMyUserId(json.id));
        dispatch(slice.actions.addUserSuccess(userID));
        // return new ApiResponse(userID);
        return new ApiResponse(userID);
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static getUserListAction = (myUserID: number, sleepMs: number = 0, isMyUserIDCheck: boolean = true) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      try {
        const startTime = Date.now();
        const res = await fetch(`${API_URL}/userList`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });
        const lowestWaitTime = sleepMs - (Date.now() - startTime);
        if (Math.sign(lowestWaitTime) === 1) {
          await _sleep(lowestWaitTime);
        }

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json: UserInfo[] = await res.json();
        dispatch(slice.actions.getUserListSuccess([json, myUserID]));

        /**
         * サーバ上に自分の情報が存在するかどうかチェック
         * 無ければ新規登録画面へ遷移する
         */
        if (isMyUserIDCheck) {
          const userInfo = json.filter(userInfo => {
            return userInfo['id'] === myUserID;
          });
          if (userInfo.length === 0) {
            remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
              title: APP_NAME,
              type: 'info',
              buttons: ['OK'],
              message: 'ユーザ情報がサーバ上に存在しないため、ユーザ登録を行います。'
            });
            dispatch(AppModule.actions.setMyUserId(-1));
            dispatch(InitialStartupModalModule.actions.initializeState());
            dispatch(InitialStartupModalModule.actions.showModal(true));
          }
        }
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyUserList());
        return new ApiResponse(null, true);
      }
    };
  };

  static changeOrderAction = (userInfo: { order: number }, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/userList/${userID}`, {
          method: 'PATCH',
          headers: AUTH_REQUEST_HEADERS,
          body: JSON.stringify(userInfo)
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyUserList());
        return new ApiResponse(null, true);
      }
    };
  };

  static updateUserInfoAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      const body = { ...userInfo };
      delete body['id'];
      delete body['order'];
      delete body['healthCheckAt'];
      try {
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
        dispatch(slice.actions.updateUserInfoSuccess());
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static updateForAddedUserInfoAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      const body = { ...userInfo };
      delete body['id'];
      try {
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
        dispatch(slice.actions.updateForAddedUserInfoSuccess());
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };
}

export default slice;
