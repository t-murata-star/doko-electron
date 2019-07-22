import { API_URL } from '../define';

/**
 * Action type
 */
export const GET_USER_LIST = 'GET_USER_LIST';
export const PUT_USER_LIST = 'PUT_USER_LIST';
export const RECEIVE_USER_LIST = 'RECEIVE_USER_LIST';
export const FAIL_REQUEST_USER_LIST = 'FAIL_REQUEST_USER_LIST';

const HEADERS = {
  "Content-type": "application/json; charset=UTF-8"
};

/**
 * Action Creator
 */
export const getUserListAction = () => ({
  type: GET_USER_LIST
});
export const updateUserInfoAction = () => ({
  type: PUT_USER_LIST
});
export const receiveUserList = (json) => ({
  type: RECEIVE_USER_LIST,
  payload: {
    response: json
  }
});
export const failRequestUserList = (error) => ({
  type: FAIL_REQUEST_USER_LIST,
  error: true,
  payload: {
    error
  }
});

export const updateUserInfo = (userInfo, id) => {
  return (dispatch) => {
    dispatch(updateUserInfoAction());
    return fetch(API_URL + 'userList/' + id,
      {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(res => {
        if (!res.ok) {
          return Promise.resolve(new Error(res.statusText));
        }
        return res.json();
      })
      .then()
      .catch(error => dispatch(failRequestUserList(error)));
  }
};

export const getUserList = () => {
  return (dispatch) => {
    dispatch(getUserListAction());
    return fetch(API_URL + 'userList',
      {
        method: 'GET',
        headers: HEADERS
      })
      .then(res => {
        if (!res.ok) {
          return Promise.resolve(new Error(res.statusText));
        }
        return res.json();
      })
      .then(json => dispatch(receiveUserList(json)))
      .catch(error => dispatch(failRequestUserList(error)));
  }
};

const shouldFetchUserList = (userList, state) => {
  if (state.userList === undefined) {
    return true;
  }
  if (state.isFetching) {
    return false;
  }
  return false;
};

export const fetchUserListIfNeeded = (userList) => {
  return (dispatch, getState) => {
    if (shouldFetchUserList(userList, getState())) {
      return dispatch(getUserList());
    }
  }
};
