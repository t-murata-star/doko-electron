import { API_URL } from '../define';

/**
 * Action type
 */
export const GET_EMPLOYEE_LIST = 'GET_EMPLOYEE_LIST';
export const PUT_EMPLOYEE_LIST = 'PUT_EMPLOYEE_LIST';
export const RECEIVE_EMPLOYEE_LIST = 'RECEIVE_EMPLOYEE_LIST';
export const FAIL_REQUEST_EMPLOYEE_LIST = 'FAIL_REQUEST_EMPLOYEE_LIST';

const HEADERS = {
  "Content-type": "application/json; charset=UTF-8"
};

/**
 * Action Creator
 */
export const getEmployeeListAction = () => ({
  type: GET_EMPLOYEE_LIST
});
export const updateEmployeeInfoAction = () => ({
  type: PUT_EMPLOYEE_LIST
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

export const updateEmployeeInfo = (employeeInfo, id) => {
  return (dispatch) => {
    dispatch(updateEmployeeInfoAction());
    return fetch(API_URL + 'employeeList/' + id,
      {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(employeeInfo),
      })
      .then(res => {
        if (!res.ok) {
          return Promise.resolve(new Error(res.statusText));
        }
        return res.json();
      })
      .then()
      .catch(error => dispatch(failRequestEmployeeList(error)));
  }
};

export const getEmployeeList = () => {
  return (dispatch) => {
    dispatch(getEmployeeListAction());
    return fetch(API_URL + 'employeeList',
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
      return dispatch(getEmployeeList());
    }
  }
};
