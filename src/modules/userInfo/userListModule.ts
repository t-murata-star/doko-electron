import { createSlice, Dispatch, Action } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';
import { LEAVING_TIME_THRESHOLD_M, API_URL, AUTH_REQUEST_HEADERS } from '../../define';
import AppModule from '../appModule';

class _initialState {
  userList: UserInfo[] = [];
  changeUserList: UserInfo[] = []; // サーバ上に登録されているユーザの中から自分のユーザを選択するために格納するユーザ一覧（userListと同じデータ）
  updatedAt: string = '';
  isFetching: boolean = false;
  isError: boolean = false;
  selectedUserId: number = -1; // ユーザ一覧画面で編集中のユーザのIDを格納する
  addedUserInfo: UserInfo = new UserInfo();
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
    updateUserInfoSuccess: (state, action) => {
      return {
        ...state,
        updatedAt: action.payload,
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
    updateStateUserList: (state, action) => {
      return {
        ...state,
        userList: action.payload
      };
    },
    addUserSuccess: (state, action) => {
      return {
        ...state,
        addedUserInfo: action.payload,
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
          return dispatch(slice.actions.requestError());
        }
        return dispatch(slice.actions.deleteUserSuccess());
      } catch (error) {
        dispatch(slice.actions.failRequest());
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
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.addUserSuccess(json));
      } catch (error) {
        dispatch(slice.actions.failRequest());
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
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.getUserListSuccess([json, myUserID]));
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyUserList());
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
          return dispatch(slice.actions.requestError());
        }
        return dispatch(slice.actions.changeOrderSuccess());
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyUserList());
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
          return dispatch(slice.actions.requestError());
        }
        const json = await res.json();
        return dispatch(slice.actions.updateUserInfoSuccess(json));
      } catch (error) {
        dispatch(slice.actions.failRequest());
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
          return dispatch(slice.actions.requestError());
        }
        return dispatch(slice.actions.updateForAddedUserInfoSuccess());
      } catch (error) {
        dispatch(slice.actions.failRequest());
      }
    };
  };
}

export default slice;
