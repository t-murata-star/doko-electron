import { API_URL, AUTH_REQUEST_HEADERS } from '../../define';
import { UserInfo } from '../../define/model';
import { Dispatch } from 'react';
import { Action } from 'redux';
import { unauthorizedActionCreator } from '../app';

/**
 * Action type
 */
export const REQUEST_ERROR = 'REQUEST_ERROR';
export const GET_USER_LIST = 'GET_USER_LIST';
export const GET_USER_LIST_SUCCESS = 'GET_USER_LIST_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const DELETE_USER = 'DELETE_USER';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export const UPDATE_USER_INFO_SUCCESS = 'UPDATE_USER_INFO_SUCCESS';
export const UPDATE_STATE_USERLIST = 'UPDATE_STATE_USERLIST';
export const CHANGE_ORDER = 'CHANGE_ORDER';
export const CHANGE_ORDER_SUCCESS = 'CHANGE_ORDER_SUCCESS';
export const UPDATE_FOR_ADDED_USER_INFO = 'UPDATE_FOR_ADDED_USER_INFO';
export const UPDATE_FOR_ADDED_USER_INFO_SUCCESS = 'UPDATE_FOR_ADDED_USER_INFO_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const SELECT_USER = 'SELECT_USER';
export const RETURN_EMPTY_USER_LIST = 'RETURN_EMPTY_USER_LIST';
export const RETURN_EMPTY_CHANGE_USER_LIST = 'RETURN_EMPTY_CHANGE_USER_LIST';
export const INOPERABLE = 'INOPERABLE';

/**
 * Action Creator
 */

export const requestErrorActionCreator = (statusCode: number, statusText: string) => ({
  type: REQUEST_ERROR,
  payload: {
    statusCode,
    statusText
  }
});
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const getUserListSccessActionCreator = (myUserID: number, userList: UserInfo[]) => ({
  type: GET_USER_LIST_SUCCESS,
  myUserID,
  payload: {
    response: userList
  }
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const addUserSuccessActionCreator = (userInfo: UserInfo) => ({
  type: ADD_USER_SUCCESS,
  userInfo
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
export const updateUserInfoSuccessActionCreator = (userList: UserInfo) => ({
  type: UPDATE_USER_INFO_SUCCESS,
  payload: {
    response: userList
  }
});
export const updateStateUserListActionCreator = (userList: UserInfo[]) => ({
  type: UPDATE_STATE_USERLIST,
  userList: JSON.parse(JSON.stringify(userList))
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
export const failRequestActionCreator = (message: string) => ({
  type: FAIL_REQUEST,
  payload: {
    message
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
export const inoperableActionCreator = (state: boolean) => ({
  type: INOPERABLE,
  state
});

export const deleteUserAction = (userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(deleteUserActionCreator());
    try {
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'DELETE',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      return dispatch(deleteUserSuccessActionCreator());
    } catch (error) {
      return dispatch(failRequestActionCreator(error.message));
    }
  };
};

export const addUserAction = (userInfo: UserInfo) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(addUserActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    try {
      const res = await fetch(`${API_URL}/userList`, {
        method: 'POST',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(addUserSuccessActionCreator(json));
    } catch (error) {
      return dispatch(failRequestActionCreator(error.message));
    }
  };
};
export const getUserListAction = (myUserID: number, sleepMs: number = 0) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getUserListActionCreator());
    try {
      await _sleep(sleepMs);
      const res = await fetch(`${API_URL}/userList`, {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(getUserListSccessActionCreator(myUserID, json));
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
      dispatch(returnEmptyUserListActionCreator());
    }
  };
};

export const changeOrderAction = (userInfo: { order: number }, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(changeOrderActionCreator());
    try {
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      return dispatch(changeOrderSuccessActionCreator());
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
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
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(updateUserInfoSuccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
    }
  };
};

export const updateForAddedUserInfoAction = (userInfo: UserInfo, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(updateForAddedUserInfoActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    try {
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      return dispatch(updateForAddedUserInfoSuccessActionCreator());
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
    }
  };
};

// スリープ処理
const _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(unauthorizedActionCreator());
      break;

    default:
      break;
  }
};
