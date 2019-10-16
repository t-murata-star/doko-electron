import * as Actions from '../actions/officeInfo';

function userListIsFetching(state = false, action) {
  switch (action.type) {
    case Actions.LOGIN:
      return true;
    default:
      return false;
  }
}

function userListIsError(
  state = {
    status: false,
    code: null,
    text: ''
  },
  action
) {
  switch (action.type) {
    case Actions.FAIL_REQUEST:
      return {
        ...state,
        status: true,
        code: action.payload.error.status,
        text: action.payload.error.statusText
      };
    default:
      return {
        ...state,
        status: false,
        code: null,
        text: ''
      };
  }
}

/**
 * 登録者情報一覧のstateを管理するReducer
 */
export default function userListState(
  state = {
    isFetching: false,
    isError: {
      status: false,
      code: null,
      text: ''
    },
    officeInfo: {}
  },
  action
) {
  switch (action.type) {
    case Actions.GET_OFFICE_INFO:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.GET_OFFICE_INFO_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    default:
      return state;
  }
}
