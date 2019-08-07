import * as Actions from '../actions/userList';

function userListIsFetching(state = false, action) {
  switch (action.type) {
    case Actions.LOGIN:
      return true;
    case Actions.GET_USER_LIST:
      return true;
    case Actions.UPDATE_USER_INFO:
      return true;
    case Actions.ADD_USER:
      return true;
    case Actions.DELETE_USER:
      return true;
    default:
      return false;
  }
}

function userListIsError(state = {
  status: false,
  code: null,
  text: ''
}, action) {
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
export default function userList(state = {
  token: '',
  isAuthenticated: false,
  userList: [],
  isFetching: false,
  isError: {
    status: false,
    code: null,
    text: ''
  },
  selectedUserId: 1,
}, action) {
  switch (action.type) {
    case Actions.LOGIN:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.response.token,
        isAuthenticated: true,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.GET_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.GET_USER_LIST_SUCCESS:
      return {
        ...state,
        userList: action.payload.response,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.FAIL_REQUEST:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.UPDATE_USER_INFO:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.UPDATE_USER_INFO_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.CHANGE_ORDER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.CHANGE_ORDER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.ADD_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.ADD_USER_SUCCESS:
      return {
        ...state,
        userInfo: action.payload.response,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.DELETE_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case Actions.DELETE_USER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action),
      };
    case Actions.SELECT_USER:
      return {
        ...state,
        selectedUserId: action.selectedUserId
      };
    case Actions.RETURN_EMPTY_USER_LIST:
      return {
        ...state,
        userList: action.userList
      }
    case Actions.UNAUTHORIZED:
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state,
      }
    default:
      return state;
  }
}
