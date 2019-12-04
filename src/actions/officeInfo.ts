import { API_URL, AUTH_REQUEST_HEADERS } from '../define';
import { Dispatch } from 'react';
import { Action } from 'redux';

/**
 * Action type
 */
export const GET_RESTROOM_USAGE = 'GET_RESTROOM_USAGE';
export const GET_RESTROOM_USAGE_SUCCESS = 'GET_RESTROOM_USAGE_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const REQUEST_ERROR = 'REQUEST_ERROR';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const RETURN_EMPTY_RESTROOM_USAGE = 'RETURN_EMPTY_RESTROOM_USAGE';

/**
 * Action Creator
 */
export const getRestroomUsageActionCreator = () => ({
  type: GET_RESTROOM_USAGE
});
export const getRestroomUsageSccessActionCreator = (json: Object) => ({
  type: GET_RESTROOM_USAGE_SUCCESS,
  payload: {
    response: json
  }
});
export const failRequestActionCreator = (message: string) => ({
  type: FAIL_REQUEST,
  payload: {
    message
  }
});
export const requestErrorActionCreator = (statusCode: number, statusText: string) => ({
  type: REQUEST_ERROR,
  payload: {
    statusCode,
    statusText
  }
});
export const unauthorizedActionCreator = () => ({
  type: UNAUTHORIZED,
  unauthorized: true
});
export const returnEmptyRestroomUsageActionCreator = () => ({
  type: RETURN_EMPTY_RESTROOM_USAGE,
  rooms: []
});

export const getRestroomUsageAction = (sleepMs: number = 0) => {
  return async (dispatch: Dispatch<Action<any>>) => {
    dispatch(getRestroomUsageActionCreator());
    try {
      await sleep(sleepMs);
      const res = await fetch(API_URL + `restrooms`, {
        method: 'GET',
        headers: AUTH_REQUEST_HEADERS
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        return dispatch(requestErrorActionCreator(res.status, res.statusText));
      }
      const json = await res.json();
      return dispatch(getRestroomUsageSccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error.message));
      dispatch(returnEmptyRestroomUsageActionCreator());
    }
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
