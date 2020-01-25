import { Action, createSlice, Dispatch } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS, LEAVING_TIME_THRESHOLD_M } from '../../define';
import { ApiResponse, UserInfo } from '../../define/model';
import AppModule from '../appModule';

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
 * LEAVING_TIME_THRESHOLD_M 以上heartbeatが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
function updateLeavingTimeForUserList(userList: UserInfo[], myUserID: number) {
  if (!userList) return [];

  const nowDate: Date = new Date();
  for (const userInfo of userList) {
    if (userInfo.id === myUserID) {
      continue;
    }
    if (['在席', '在席 (離席中)'].includes(userInfo['status']) === true) {
      const heartbeat: Date = new Date(userInfo['heartbeat']);
      const diffMin = Math.floor((nowDate.getTime() - heartbeat.getTime()) / (1000 * 60));
      if (diffMin >= LEAVING_TIME_THRESHOLD_M) {
        userInfo['status'] = '退社';
        // 更新日時を最後のheartbeat送信日時に設定する
        userInfo['updatedAt'] = userInfo['heartbeat'];
      }
    }
  }

  return userList;
}

// スリープ処理
const _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export class AsyncActionsUserList {
  static deleteUserAction = (userID: number) => {
    return async (dispatch: Dispatch<Action<any>>) => {
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
    return async (dispatch: Dispatch<Action<any>>) => {
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

  static getUserListAction = (myUserID: number, sleepMs: number = 0) => {
    return async (dispatch: Dispatch<Action<any>>) => {
      dispatch(slice.actions.startApiRequest());
      try {
        await _sleep(sleepMs);
        const res = await fetch(`${API_URL}/userList`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json = await res.json();
        dispatch(slice.actions.getUserListSuccess([json, myUserID]));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyUserList());
        return new ApiResponse(null, true);
      }
    };
  };

  static changeOrderAction = (userInfo: { order: number }, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>) => {
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
    return async (dispatch: Dispatch<Action<any>>) => {
      dispatch(slice.actions.startApiRequest());
      const body = { ...userInfo };
      delete body['id'];
      delete body['order'];
      delete body['heartbeat'];
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
    return async (dispatch: Dispatch<Action<any>>) => {
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
