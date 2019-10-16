import { API_URL, AUTH_REQUEST_HEADERS } from '../define';
import { unauthorizedActionCreator, failRequestActionCreator } from './userList';

/**
 * Action type
 */
export const GET_RESTROOM_USAGE = 'GET_RESTROOM_USAGE';
export const GET_RESTROOM_USAGE_SUCCESS = 'GET_RESTROOM_USAGE_SUCCESS';
export const UPDATE_RESTROOM_USAGE = 'UPDATE_RESTROOM_USAGE';
export const UPDATE_RESTROOM_USAGE_SUCCESS = 'UPDATE_RESTROOM_USAGE_SUCCESS';

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
export const updateRestroomUsageActionCreator = () => ({
  type: UPDATE_RESTROOM_USAGE
});
export const updateRestroomUsageSuccessActionCreator = json => ({
  type: UPDATE_RESTROOM_USAGE_SUCCESS,
  payload: {
    response: json
  }
});

export const getRestroomUsageAction = (gender, place) => {
  return async dispatch => {
    dispatch(getRestroomUsageActionCreator());
    try {
      const res = await fetch(API_URL + `restroom?gender=${gender}&place=${place}`, {
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

export const updateRestroomUsageAction = (userInfo, userID) => {
  return async dispatch => {
    dispatch(updateRestroomUsageActionCreator());
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
      if (res.status === 401) {
        dispatch(unauthorizedActionCreator());
      }
      if (!res.ok) {
        return Promise.reject(res);
      }
      const json = await res.json();
      return dispatch(updateRestroomUsageSuccessActionCreator(json));
    } catch (error) {
      dispatch(failRequestActionCreator(error));
    }
  };
};
