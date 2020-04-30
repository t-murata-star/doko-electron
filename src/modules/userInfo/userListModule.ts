import { Action, createSlice, Dispatch, createAction } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS, APP_NAME } from '../../define';
import { ApiResponse, UserInfo, UserInfoForUpdate } from '../../define/model';
import AppModule from '../appModule';
import { initialStartupModalSlice } from '../initialStartupModalModule';
const { remote } = window.require('electron');

class _initialState {
  userList: UserInfo[] = [];
  isFetching: boolean = false;
  isError: boolean = false;
  selectedUserId: number = -1; // ユーザ一覧画面で編集中のユーザのIDを格納する
  inoperable: boolean = false;
}

// createSlice() で actions と reducers を一気に生成
export const userListSlice = createSlice({
  name: 'userList',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: (state) => {
      return {
        ...state,
        isFetching: true,
      };
    },
    failRequest: (state) => {
      return {
        ...state,
        isFetching: false,
        isError: true,
      };
    },
    getUserListSuccess: (state, action) => {
      return {
        ...state,
        userList: action.payload,
        isFetching: false,
        isError: false,
      };
    },
    updateUserInfoSuccess: (state) => {
      return {
        ...state,
        isFetching: false,
        isError: false,
      };
    },
    addUserSuccess: (state) => {
      return {
        ...state,
        isFetching: false,
        isError: false,
      };
    },
    deleteUserSuccess: (state) => {
      return {
        ...state,
        isFetching: false,
        isError: false,
      };
    },
    selectUser: (state, action) => {
      return {
        ...state,
        selectedUserId: action.payload,
      };
    },
    inoperable: (state, action) => {
      return {
        ...state,
        inoperable: action.payload,
      };
    },
    reRenderUserList: (state) => {
      return {
        ...state,
        userList: JSON.parse(JSON.stringify(state.userList)),
      };
    },
  },
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

// スリープ処理
const _sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));

export class UserListActionsForAsync {
  static updateUserInfoOrder = createAction(
    `${userListSlice.name}/updateUserInfoOrder`,
    (rowComponent: Tabulator.RowComponent) => {
      return {
        payload: {
          rowComponent,
        },
      };
    }
  );

  static deleteUserAction = (userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(userListSlice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/userList/${userID}`, {
          method: 'DELETE',
          headers: AUTH_REQUEST_HEADERS,
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        dispatch(userListSlice.actions.deleteUserSuccess());
        return new ApiResponse();
      } catch (error) {
        dispatch(userListSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static addUserAction = (userInfo: UserInfo) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(userListSlice.actions.startApiRequest());
      const body = { ...userInfo };
      // id はAPIサーバで自動採番のため、キーを削除する
      delete body.id;
      try {
        const res = await fetch(`${API_URL}/userList`, {
          method: 'POST',
          headers: AUTH_REQUEST_HEADERS,
          body: JSON.stringify(body),
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        const json: UserInfo = await res.json();
        const userID = json.id;
        dispatch(AppModule.actions.setMyUserId(json.id));
        dispatch(userListSlice.actions.addUserSuccess());
        // return new ApiResponse(userID);
        return new ApiResponse(userID);
      } catch (error) {
        dispatch(userListSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static getUserListAction = (myUserID: number, sleepMs: number = 0, isMyUserIDCheck: boolean = true) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(userListSlice.actions.startApiRequest());
      try {
        const startTime = Date.now();
        const res = await fetch(`${API_URL}/userList`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS,
        });
        const lowestWaitTime = sleepMs - (Date.now() - startTime);
        if (Math.sign(lowestWaitTime) === 1) {
          await _sleep(lowestWaitTime);
        }

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        const json: UserInfo[] = await res.json();
        dispatch(userListSlice.actions.getUserListSuccess(json));

        /**
         * サーバ上に自分の情報が存在するかどうかチェック
         * 無ければ新規登録画面へ遷移する
         */
        if (isMyUserIDCheck) {
          const userInfo = json.filter((userInfo) => {
            return userInfo.id === myUserID;
          });
          if (userInfo.length === 0) {
            remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
              title: APP_NAME,
              type: 'info',
              buttons: ['OK'],
              message: 'ユーザ情報がサーバ上に存在しないため、ユーザ登録を行います。',
            });
            dispatch(AppModule.actions.setMyUserId(-1));
            dispatch(initialStartupModalSlice.actions.initializeState());
            dispatch(initialStartupModalSlice.actions.showModal(true));
          }
        }
        return new ApiResponse();
      } catch (error) {
        dispatch(userListSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static changeOrderAction = (userInfo: UserInfoForUpdate, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(userListSlice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/userList/${userID}`, {
          method: 'PATCH',
          headers: AUTH_REQUEST_HEADERS,
          body: JSON.stringify(userInfo),
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        return new ApiResponse();
      } catch (error) {
        dispatch(userListSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static updateUserInfoAction = (userInfo: UserInfoForUpdate, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(userListSlice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/userList/${userID}`, {
          method: 'PATCH',
          headers: AUTH_REQUEST_HEADERS,
          body: JSON.stringify(userInfo),
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          throw new Error();
        }
        dispatch(userListSlice.actions.updateUserInfoSuccess());
        return new ApiResponse();
      } catch (error) {
        dispatch(userListSlice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };
}
