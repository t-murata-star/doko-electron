import { API_URL, LOGIN_REQUEST_HEADERS, AUTH_REQUEST_HEADERS, LOGIN_USER } from '../define';

/**
 * Action type
 */
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const GET_USER_LIST = 'GET_USER_LIST';
export const GET_USER_LIST_SUCCESS = 'GET_USER_LIST_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const DELETE_USER = 'DELETE_USER';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export const UPDATE_USER_INFO_SUCCESS = 'UPDATE_USER_INFO_SUCCESS';
export const CHANGE_ORDER = 'CHANGE_ORDER';
export const CHANGE_ORDER_SUCCESS = 'CHANGE_ORDER_SUCCESS';
export const UPDATE_FOR_ADDED_USER_INFO = 'UPDATE_FOR_ADDED_USER_INFO';
export const UPDATE_FOR_ADDED_USER_INFO_SUCCESS = 'UPDATE_FOR_ADDED_USER_INFO_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const SELECT_USER = 'SELECT_USER';
export const RETURN_EMPTY_USER_LIST = 'RETURN_EMPTY_USER_LIST';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const CHECK_NOTIFICATION = 'CHECK_NOTIFICATION';
export const CHECK_NOTIFICATION_SUCCESS = 'CHECK_NOTIFICATION_SUCCESS';
export const SEND_HEARTBEAT = 'SEND_HEARTBEAT';
export const SEND_HEARTBEAT_SUCCESS = 'SEND_HEARTBEAT_SUCCESS';

/**
 * Action Creator
 */

export const loginActionCreator = () => ({
  type: LOGIN
});
export const loginSuccessActionCreator = json => ({
  type: LOGIN_SUCCESS,
  payload: {
    response: json
  }
});
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const getUserListSccessActionCreator = json => ({
  type: GET_USER_LIST_SUCCESS,
  payload: {
    response: json
  }
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const addUserSuccessActionCreator = userInfo => ({
  type: ADD_USER_SUCCESS,
  payload: {
    response: userInfo
  }
});
export const deleteUserActionCreator = () => ({
  type: DELETE_USER
});
export const deleteUserSuccessActionCreator = () => ({
  type: DELETE_USER_SUCCESS,
});
export const updateUserInfoActionCreator = () => ({
  type: UPDATE_USER_INFO
});
export const updateUserInfoSuccessActionCreator = () => ({
  type: UPDATE_USER_INFO_SUCCESS
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
export const failRequestActionCreator = error => ({
  type: FAIL_REQUEST,
  error: true,
  payload: {
    error
  }
});
export const selectUserActionCreator = selectedUserId => ({
  type: SELECT_USER,
  selectedUserId: selectedUserId
});
export const returnEmptyUserListActionCreator = () => ({
  type: RETURN_EMPTY_USER_LIST,
  userList: []
});
export const unauthorizedActionCreator = () => ({
  type: UNAUTHORIZED,
  unauthorized: true
});
export const getNotificationActionCreator = () => ({
  type: CHECK_NOTIFICATION
});
export const checkNotificationSuccessActionCreator = notification => ({
  type: CHECK_NOTIFICATION_SUCCESS,
  notification
});
export const sendHeartbeatActionCreator = () => ({
  type: SEND_HEARTBEAT
});
export const sendHeartbeatSuccessActionCreator = () => ({
  type: SEND_HEARTBEAT_SUCCESS,
});

export const loginAction = () => {
  return async dispatch => {
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
    }
    catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  }
};

export const deleteUserAction = (userID) => {
  return async dispatch => {
    dispatch(deleteUserActionCreator());
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'DELETE',
        headers: AUTH_REQUEST_HEADERS
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(deleteUserSuccessActionCreator());
    }
    catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  }
};

export const addUserAction = (userInfo) => {
  return async dispatch => {
    dispatch(addUserActionCreator());
    try {
      const res = await fetch(API_URL + 'userList', {
        method: 'POST',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(addUserSuccessActionCreator(json));
    }
    catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  }
};

export const getUserListAction = () => {
  return async dispatch => {
    dispatch(getUserListActionCreator());
    try {
      const res = await fetch(API_URL + 'userList', {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(getUserListSccessActionCreator(json));
    }
    catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListAction());
    }
  }
};

export const changeOrderAction = (userInfo, userID) => {
  return async dispatch => {
    dispatch(changeOrderActionCreator());
    const body = Object.assign({}, userInfo);
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(changeOrderSuccessActionCreator());
    }
    catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListAction());
    }
  }
};

export const updateUserInfoAction = (userInfo, userID) => {
  return async dispatch => {
    dispatch(updateUserInfoActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    delete body['order'];
    delete body['heartbeat'];
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(updateUserInfoSuccessActionCreator());
    }
    catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListAction());
    }
  }
};

export const updateForAddedUserInfoAction = (userInfo, userID) => {
  return async dispatch => {
    dispatch(updateForAddedUserInfoActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    try {
      const res = await fetch(API_URL + 'userList/' + userID, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      return dispatch(updateForAddedUserInfoSuccessActionCreator());
    }
    catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyUserListAction());
    }
  }
};

export const returnEmptyUserListAction = () => {
  return dispatch => dispatch(returnEmptyUserListActionCreator());
}

export const getNotificationAction = () => {
  return async dispatch => {
    dispatch(getNotificationActionCreator());
    try {
      const res = await fetch(API_URL + 'notification', {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(checkNotificationSuccessActionCreator(json));
    }
    catch (error) {
      return dispatch(failRequestActionCreator(error));
    }
  }
};

export const sendHeartbeatAction = (userInfo, userID) => {
  return async dispatch => {
    dispatch(sendHeartbeatActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    delete body['order'];
    const res = await fetch(API_URL + 'userList/' + userID, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      dispatch(unauthorizedActionCreator());
    }
    if (!res.ok) {
      return Promise.reject(res);
    }
    return dispatch(sendHeartbeatSuccessActionCreator());
  }
};
