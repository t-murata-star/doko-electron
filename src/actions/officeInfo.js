import { API_URL, AUTH_REQUEST_HEADERS } from '../define';

/**
 * Action type
 */
export const GET_RESTROOM_USAGE = 'GET_RESTROOM_USAGE';
export const GET_RESTROOM_USAGE_SUCCESS = 'GET_RESTROOM_USAGE_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const UNAUTHORIZED = 'UNAUTHORIZED';

/**
 * Action Creator
 */
export const getRestroomUsageActionCreator = () => ({
  type: GET_RESTROOM_USAGE
});
export const getRestroomUsageSccessActionCreator = json => ({
  type: GET_RESTROOM_USAGE_SUCCESS,
  payload: {
    response: json
  }
});
export const failRequestActionCreator = error => ({
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

export const getRestroomUsageAction = () => {
  return async dispatch => {
    dispatch(getRestroomUsageActionCreator());
    try {
      await sleep(200);
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
    }
  };
};

// スリープ処理
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
