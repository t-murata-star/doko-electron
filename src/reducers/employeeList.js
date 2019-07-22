import * as Actions from '../actions/employeeList';

function employeeListIsFetching(state = false, action) {
  switch (action.type) {
    case Actions.GET_EMPLOYEE_LIST:
      return true;
    default:
      return false;
  }
}

function employeeListIsError(state = {
  status: false,
  error: null
}, action) {
  switch (action.type) {
    case Actions.FAIL_REQUEST_EMPLOYEE_LIST:
      return {
        ...state,
        status: true,
        error: action.payload.error
      };
    default:
      return {
        ...state,
        status: false,
        error: null
      };
  }
}

/**
 * 登録者情報一覧のstateを管理するReducer
 */
export default function employeeList(state = {
  employeeList: [],
  isFetching: false,
  isError: {
    status: false,
    error: null
  },
}, action) {
  switch (action.type) {
    case Actions.GET_EMPLOYEE_LIST:
      return {
        ...state,
        isFetching: employeeListIsFetching(state.isFetching, action)
      };
    case Actions.RECEIVE_EMPLOYEE_LIST:
      return {
        ...state,
        employeeList: action.payload.response,
        isFetching: employeeListIsFetching(state.isFetching, action)
      };
    case Actions.FAIL_REQUEST_EMPLOYEE_LIST:
      return {
        ...state,
        isError: employeeListIsError(state.isError, action),
        isFetching: employeeListIsFetching(state.isFetching, action)
      };
    default:
      return state;
  }
}
