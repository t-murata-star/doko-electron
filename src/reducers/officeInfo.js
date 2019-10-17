import * as OfficeInfoActions from '../actions/officeInfo';
import * as UserListActions from '../actions/userList';

export function officeInfoIsFetching(state = false, action) {
  switch (action.type) {
    case OfficeInfoActions.GET_RESTROOM_USAGE:
      return true;
    case OfficeInfoActions.UPDATE_RESTROOM_USAGE:
      return true;
    default:
      return false;
  }
}

export function officrInfoIsError(
  state = {
    status: false,
    code: null,
    text: ''
  },
  action
) {
  switch (action.type) {
    case UserListActions.FAIL_REQUEST:
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
export default function officeInfoState(
  state = {
    isFetching: false,
    isError: {
      status: false,
      code: null,
      text: ''
    },
    restrooms: {
      rooms: [],
      isNoVacancyForMen: false,
      isNoVacancyForWomen: false
    }
  },
  action
) {
  switch (action.type) {
    case OfficeInfoActions.GET_RESTROOM_USAGE:
      return {
        ...state,
        isFetching: officeInfoIsFetching(state.isFetching, action)
      };
    case OfficeInfoActions.GET_RESTROOM_USAGE_SUCCESS:
      return {
        ...state,
        isFetching: officeInfoIsFetching(state.isFetching, action),
        isError: officrInfoIsError(state.isError, action)
      };
    case OfficeInfoActions.UPDATE_RESTROOM_USAGE:
      return {
        ...state,
        isFetching: officeInfoIsFetching(state.isFetching, action)
      };
    case OfficeInfoActions.UPDATE_RESTROOM_USAGE_SUCCESS:
      return {
        ...state,
        updatedAt: action.payload.response.updated_at,
        isFetching: officeInfoIsFetching(state.isFetching, action),
        isError: officrInfoIsError(state.isError, action)
      };
    default:
      return state;
  }
}
