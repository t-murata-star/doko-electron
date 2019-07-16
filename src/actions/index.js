import { API_URL } from '../define';

/**
 * Action type
 */
export const REQUEST_EMPLOYEE_LIST = 'REQUEST_EMPLOYEE_LIST';
export const RECEIVE_EMPLOYEE_LIST = 'RECEIVE_EMPLOYEE_LIST';
export const REFRESH_EMPLOYEE_LIST = 'REFRESH_EMPLOYEE_LIST';
export const FAIL_REQUEST_EMPLOYEE_LIST = 'FAIL_REQUEST_EMPLOYEE_LIST';

/**
 * Action Creator
 */
export const requestEmployeeList = () => ({
  type: REQUEST_EMPLOYEE_LIST
});

export const receiveEmployeeList = (json) => ({
  type: RECEIVE_EMPLOYEE_LIST,
  payload: {
    response: json
  }
});

export const failRequestEmployeeList = (error) => ({
  type: FAIL_REQUEST_EMPLOYEE_LIST,
  error: true,
  payload: {
    error
  }
});

export const fetchEmployeeList = () => {
  return (dispatch) => {
    dispatch(requestEmployeeList());
    return fetch(API_URL + 'employeeList')
      .then(res => {
        if (!res.ok) {
          return Promise.resolve(new Error(res.statusText));
        }
        return res.json();
      })
      .then(json => dispatch(receiveEmployeeList(json)))
      .catch(error => dispatch(failRequestEmployeeList(error)));
  }
};

const shouldFetchEmployeeList = (employeeList, state) => {
  if (state.employeeList === undefined) {
    return true;
  }
  if (state.isFetching) {
    return false;
  }
  return false;
};

export const fetchEmployeeListIfNeeded = (employeeList) => {
  return (dispatch, getState) => {
    if (shouldFetchEmployeeList(employeeList, getState())) {
      return dispatch(fetchEmployeeList());
    }
  }
};
