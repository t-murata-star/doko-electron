import { API_URL, LOGIN_REQUEST_HEADERS, AUTH_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfo, Notification } from '../define/model';
import { Dispatch } from 'react';
import { Action } from 'redux';

/**
 * Action type
 */
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const GET_USER_LIST = 'GET_USER_LIST';
export const GET_USER_LIST_SUCCESS = 'GET_USER_LIST_SUCCESS';
export const GET_CHANGE_USER_LIST = 'GET_CHANGE_USER_LIST';
export const GET_CHANGE_USER_LIST_SUCCESS = 'GET_CHANGE_USER_LIST_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const DELETE_USER = 'DELETE_USER';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export const UPDATE_USER_INFO_SUCCESS = 'UPDATE_USER_INFO_SUCCESS';
export const SET_UPDATED_AT = 'SET_UPDATED_AT';
export const CHANGE_ORDER = 'CHANGE_ORDER';
export const CHANGE_ORDER_SUCCESS = 'CHANGE_ORDER_SUCCESS';
export const UPDATE_FOR_ADDED_USER_INFO = 'UPDATE_FOR_ADDED_USER_INFO';
export const UPDATE_FOR_ADDED_USER_INFO_SUCCESS = 'UPDATE_FOR_ADDED_USER_INFO_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const SELECT_USER = 'SELECT_USER';
export const RETURN_EMPTY_USER_LIST = 'RETURN_EMPTY_USER_LIST';
export const RETURN_EMPTY_CHANGE_USER_LIST = 'RETURN_EMPTY_CHANGE_USER_LIST';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const CHECK_NOTIFICATION = 'CHECK_NOTIFICATION';
export const CHECK_NOTIFICATION_SUCCESS = 'CHECK_NOTIFICATION_SUCCESS';
export const SEND_HEARTBEAT = 'SEND_HEARTBEAT';
export const SEND_HEARTBEAT_SUCCESS = 'SEND_HEARTBEAT_SUCCESS';
export const SET_MY_USER_ID = 'SET_MY_USER_ID';

/**
 * Action Creator
 */

export const loginActionCreator = () => ({
  type: LOGIN
});
export const loginSuccessActionCreator = (json: Object) => ({
  type: LOGIN_SUCCESS,
  payload: {
    response: json
  }
});
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const getUserListSccessActionCreator = (json: Object) => ({
  type: GET_USER_LIST_SUCCESS,
  payload: {
    response: json
  }
});
export const getChangeUserListActionCreator = () => ({
  type: GET_CHANGE_USER_LIST
});
export const getChangeUserListSccessActionCreator = (json: Object) => ({
  type: GET_CHANGE_USER_LIST_SUCCESS,
  payload: {
    response: json
  }
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const addUserSuccessActionCreator = (userInfo: UserInfo) => ({
  type: ADD_USER_SUCCESS,
  userID: userInfo.id
});
export const deleteUserActionCreator = () => ({
  type: DELETE_USER
});
export const deleteUserSuccessActionCreator = () => ({
  type: DELETE_USER_SUCCESS
});
export const updateUserInfoActionCreator = () => ({
  type: UPDATE_USER_INFO
});
export const updateUserInfoSuccessActionCreator = (json: Object) => ({
  type: UPDATE_USER_INFO_SUCCESS,
  payload: {
    response: json
  }
});
export const setUpdatedAtActionCreator = (userList: UserInfo[]) => ({
  type: SET_UPDATED_AT,
  userList
});
export const changeOrderActionCreator = () => ({
  type: CHANGE_ORDER
});
export const changeOrderSuccessActionCreator = () => ({
  type: CHANGE_ORDER_SUCCESS
});
export const updateForAddedUserInfoActionCreator = () => ({
  type: UPDATE_FOR_ADDED_USER_INFO
});
export const updateForAddedUserInfoSuccessActionCreator = () => ({
  type: UPDATE_FOR_ADDED_USER_INFO_SUCCESS
});
export const failRequestActionCreator = (error: Error) => ({
  type: FAIL_REQUEST,
  error: true,
  payload: {
    error
  }
});
export const selectUserActionCreator = (selectedUserId: number) => ({
  type: SELECT_USER,
  selectedUserId: selectedUserId
});
export const returnEmptyUserListActionCreator = () => ({
  type: RETURN_EMPTY_USER_LIST,
  userList: []
});
export const returnEmptyChangeUserListActionCreator = () => ({
  type: RETURN_EMPTY_CHANGE_USER_LIST,
  changeUserList: []
});
export const unauthorizedActionCreator = () => ({
  type: UNAUTHORIZED,
  unauthorized: true
});
export const getNotificationActionCreator = () => ({
  type: CHECK_NOTIFICATION
});
export const checkNotificationSuccessActionCreator = (notification: Notification) => ({
  type: CHECK_NOTIFICATION_SUCCESS,
  notification
});
export const sendHeartbeatActionCreator = () => ({
  type: SEND_HEARTBEAT
});
export const sendHeartbeatSuccessActionCreator = () => ({
  type: SEND_HEARTBEAT_SUCCESS
});
export const setMyUserIDActionCreator = (userID: number) => ({
  type: SET_MY_USER_ID,
  userID
});

export const loginAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(loginActionCreator());
    try {
      const res = await fetch(API_URL + 'auth/login', {
        method: 'POST',
        headers: LOGIN_REQUEST_HEADERS,
        body: JSON.stringify(LOGIN_USER)
      });
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(loginSuccessActionCreator(json));
    } catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  };
};

export const deleteUserAction = (userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(deleteUserActionCreator());
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'DELETE',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(deleteUserSuccessActionCreator());
    } catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  };
};

export const addUserAction = (userInfo: UserInfo) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(addUserActionCreator());
    try {
      const res = await fetch(API_URL + 'userList', {
        method: 'POST',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo)
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(addUserSuccessActionCreator(json));
    } catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  };
};
export const getUserListAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getUserListActionCreator());
    try {
      await sleep(200);
      const res = await fetch(API_URL + 'userList', {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(getUserListSccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListActionCreator());
    }
  };
};

export const getChangeUserListAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getChangeUserListActionCreator());
    try {
      await sleep(200);
      const res = await fetch(API_URL + 'userList', {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(getChangeUserListSccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyChangeUserListActionCreator());
    }
  };
};

export const changeOrderAction = (userInfo: { order: number }, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(changeOrderActionCreator());
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo)
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(changeOrderSuccessActionCreator());
    } catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListActionCreator());
    }
  };
};

export const updateUserInfoAction = (userInfo: UserInfo, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(updateUserInfoActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    delete body['order'];
    delete body['heartbeat'];
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(updateUserInfoSuccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error));
    }
  };
};

export const updateForAddedUserInfoAction = (userInfo: UserInfo, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(updateForAddedUserInfoActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(updateForAddedUserInfoSuccessActionCreator());
    } catch (error) {
      dispatch(failRequestActionCreator(error));
    }
  };
};

export const getNotificationAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getNotificationActionCreator());
    try {
      const res = await fetch(API_URL + 'notification', {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(checkNotificationSuccessActionCreator(json));
    } catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  };
};

export const sendHeartbeatAction = (userInfo: UserInfo, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(sendHeartbeatActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    delete body['order'];
    const res = await fetch(API_URL + 'userList/' + userID, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(body)
    });

    responseStatusCheck(dispatch, res.status);

    if (!res.ok) {
      return Promise.reject(res);
    }
    return dispatch(sendHeartbeatSuccessActionCreator());
  };
};

// スリープ処理
const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(unauthorizedActionCreator());
      break;

    default:
      break;
  }
}
