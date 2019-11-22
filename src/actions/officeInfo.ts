import { API_URL, AUTH_REQUEST_HEADERS } from '../define';
import { Dispatch } from 'react';
import { Action } from 'redux';

/**
 * Action type
 */
export const GET_RESTROOM_USAGE = 'GET_RESTROOM_USAGE';
export const GET_RESTROOM_USAGE_SUCCESS = 'GET_RESTROOM_USAGE_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
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
export const failRequestActionCreator = (error: Error) => ({
  type: FAIL_REQUEST,
  error: true,
  payload: {
    error
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
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(getRestroomUsageSccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error));
      dispatch(returnEmptyRestroomUsageActionCreator());
    }
  };
};

// スリープ処理
const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));
