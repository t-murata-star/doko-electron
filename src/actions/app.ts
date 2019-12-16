import { API_URL, LOGIN_REQUEST_HEADERS, AUTH_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfo, Notification } from '../define/model';
import { Dispatch } from 'react';
import { Action } from 'redux';

/**
 * Action type
 */
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REQUEST_ERROR = 'REQUEST_ERROR';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const CHECK_NOTIFICATION = 'CHECK_NOTIFICATION';
export const CHECK_NOTIFICATION_SUCCESS = 'CHECK_NOTIFICATION_SUCCESS';
export const SEND_HEARTBEAT = 'SEND_HEARTBEAT';
export const SEND_HEARTBEAT_SUCCESS = 'SEND_HEARTBEAT_SUCCESS';
export const SET_MY_USER_ID = 'SET_MY_USER_ID';
export const GET_S3_SIGNED_URL = 'GET_S3_SIGNED_URL';
export const GET_S3_SIGNED_URL_SUCCESS = 'GET_S3_SIGNED_URL_SUCCESS';

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
export const requestErrorActionCreator = (statusCode: number, statusText: string) => ({
  type: REQUEST_ERROR,
  payload: {
    statusCode,
    statusText
  }
});
export const failRequestActionCreator = (message: string) => ({
  type: FAIL_REQUEST,
  payload: {
    message
  }
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
export const getS3SignedUrlActionCreator = () => ({
  type: GET_S3_SIGNED_URL
});
export const getS3SignedUrlSuccessActionCreator = (json: any) => ({
  type: GET_S3_SIGNED_URL_SUCCESS,
  updateInstallerUrl: json.url
});

export const loginAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(loginActionCreator());
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: LOGIN_REQUEST_HEADERS,
        body: JSON.stringify(LOGIN_USER)
      });

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(loginSuccessActionCreator(json));
    } catch (error) {
      return dispatch(failRequestActionCreator(error.message));
    }
  };
};

export const getNotificationAction = () => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getNotificationActionCreator());
    try {
      const res = await fetch(`${API_URL}/notification`, {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(checkNotificationSuccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
    }
  };
};

export const sendHeartbeatAction = (userInfo: UserInfo, userID: number) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(sendHeartbeatActionCreator());
    const body = Object.assign({}, userInfo);
    delete body['id'];
    delete body['order'];
    const res = await fetch(`${API_URL}/userList/${userID}`, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(body)
    });

    responseStatusCheck(dispatch, res.status);

    if (res.ok === false) {
      return dispatch(requestErrorActionCreator(res.status, res.statusText));
    }
    return dispatch(sendHeartbeatSuccessActionCreator());
  };
};

export const getS3SignedUrlAction = (fileName: string) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getS3SignedUrlActionCreator());
    try {
      const res = await fetch(`${API_URL}/getS3SignedUrl?fileName=${fileName}`, {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(getS3SignedUrlSuccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
    }
  };
};

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(unauthorizedActionCreator());
      break;

    default:
      break;
  }
};
