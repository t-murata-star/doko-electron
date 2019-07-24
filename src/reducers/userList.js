import * as Actions from '../actions/userList';

function userListIsFetching(state = false, action) {
  switch (action.type) {
    case Actions.GET_USER_LIST:
      return true;
    case Actions.PUT_USER_LIST:
      return true;
    default:
      return false;
  }
}

function userListIsError(state = {
  status: false,
  error: null
}, action) {
  switch (action.type) {
    case Actions.FAIL_REQUEST_USER_LIST:
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
export default function userList(state = {
  userList: [],
  isFetching: false,
  isError: {
    status: false,
    error: null
  },
  selectedUserId: 1,
}, action) {
  switch (action.type) {
    case Actions.GET_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.RECEIVE_USER_LIST:
      return {
        ...state,
        userList: action.payload.response,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.FAIL_REQUEST_USER_LIST:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.PUT_USER_LIST:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.SUCCESS_PUT_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.SELECT_USER:
      return {
        ...state,
        selectedUserId: action.selectedUserId
      };
    default:
      return state;
  }
}
