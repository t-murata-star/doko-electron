import { API_URL, LOGIN_REQUEST_HEADERS, AUTH_REQUEST_HEADERS, LOGIN_USER } from '../define';

/**
 * Action type
 */
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const GET_USER_LIST = 'GET_USER_LIST';
export const GET_USER_LIST_SUCCESS = 'GET_USER_LIST_SUCCESS';
export const PUT_USER_INFO = 'PUT_USER_INFO';
export const PUT_USER_INFO_SUCCESS = 'PUT_USER_INFO_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const DELETE_USER = 'DELETE_USER';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const PATCH_USER_INFO = 'PATCH_USER_INFO';
export const PATCH_USER_INFO_SUCCESS = 'PATCH_USER_INFO_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const SELECT_USER = 'SELECT_USER';
export const RETURN_EMPTY_USER_LIST = 'RETURN_EMPTY_USER_LIST';
export const UNAUTHORIZED = 'UNAUTHORIZED';

/**
 * Action Creator
 */

export const loginActionCreator = () => ({
  type: LOGIN
});
export const loginSuccessActionCreator = (json) => ({
  type: LOGIN_SUCCESS,
  payload: {
    response: json
  }
});
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const getUserListSccessActionCreator = (json) => ({
  type: GET_USER_LIST_SUCCESS,
  payload: {
    response: json
  }
});
export const updateUserInfoActionCreator = () => ({
  type: PUT_USER_INFO
});
export const updateUserInfoSuccessActionCreator = () => ({
  type: PUT_USER_INFO_SUCCESS
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const addUserSuccessActionCreator = (userInfo) => ({
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
export const patchUserInfoActionCreator = () => ({
  type: PATCH_USER_INFO
});
export const patchUserInfoSuccessActionCreator = () => ({
  type: PATCH_USER_INFO_SUCCESS
});
export const failRequestActionCreator = (error) => ({
  type: FAIL_REQUEST,
  error: true,
  payload: {
    error
  }
});
export const selectUserActionCreator = (selectedUserId) => ({
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

export const loginAction = () => {
  return (dispatch) => {
    dispatch(loginActionCreator());
    return fetch(API_URL + 'auth/login',
      {
        method: 'POST',
        headers: LOGIN_REQUEST_HEADERS,
        body: JSON.stringify(LOGIN_USER)
      })
      .then(async res => {
        if (!res.ok) {
          return Promise.reject(res);
        }
        const json = await res.json();
        return json;
      })
      .then(json => dispatch(loginSuccessActionCreator(json)))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const deleteUserAction = (userID) => {
  return (dispatch) => {
    dispatch(deleteUserActionCreator());
    return fetch(API_URL + 'userList/' + userID,
      {
        method: 'DELETE',
        headers: AUTH_REQUEST_HEADERS
      })
      .then(async res => {
        if (res.status === 401) {
          dispatch(unauthorizedActionCreator());
        }
        if (!res.ok) {
          return Promise.reject(res);
        }
        return;
      })
      .then(() => dispatch(deleteUserSuccessActionCreator()))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const addUserAction = (userInfo) => {
  return (dispatch) => {
    dispatch(addUserActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'POST',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(async res => {
        if (res.status === 401) {
          dispatch(unauthorizedActionCreator());
        }
        if (!res.ok) {
          return Promise.reject(res);
        }
        const json = await res.json();
        return json;
      })
      .then(userInfo => dispatch(addUserSuccessActionCreator(userInfo)))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const updateUserInfoAction = (userInfo, userID) => {
  return (dispatch) => {
    dispatch(updateUserInfoActionCreator());
    return fetch(API_URL + 'userList/' + userID,
      {
        method: 'PUT',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(res => {
        if (res.status === 401) {
          dispatch(unauthorizedActionCreator());
        }
        if (!res.ok) {
          return Promise.reject(res);
        }
        return;
      })
      .then(() => dispatch(updateUserInfoSuccessActionCreator()))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const getUserListAction = () => {
  return (dispatch) => {
    dispatch(getUserListActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      })
      .then(async res => {
        if (res.status === 401) {
          dispatch(unauthorizedActionCreator());
        }
        if (!res.ok) {
          return Promise.reject(res);
        }
        const json = await res.json();
        return json;
      })
      .then(json => dispatch(getUserListSccessActionCreator(json)))
      .catch(error => {
        dispatch(failRequestActionCreator(error))
        dispatch(returnEmptyUserListAction());
      });
  }
};

export const patchUserInfoAction = (userInfo, userID) => {
  return (dispatch) => {
    dispatch(patchUserInfoActionCreator());
    return fetch(API_URL + 'userList/' + userID,
      {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(res => {
        if (res.status === 401) {
          dispatch(unauthorizedActionCreator());
        }
        if (!res.ok) {
          return Promise.reject(res);
        }
        return;
      })
      .then(() => dispatch(patchUserInfoSuccessActionCreator()))
      .catch(error => {
        dispatch(failRequestActionCreator(error))
        dispatch(returnEmptyUserListAction());
      });
  }
};

export const returnEmptyUserListAction = () => {
  return (dispatch) => {
    dispatch(returnEmptyUserListActionCreator());
  }
}
