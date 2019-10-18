import * as OfficeInfoActions from '../actions/officeInfo';
import * as UserListActions from '../actions/userList';

export function officeInfoIsFetching(state = false, action) {
  switch (action.type) {
    case OfficeInfoActions.GET_RESTROOM_USAGE:
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
      isNoVacancyForWomen: false,
      vacancyForMen: 0,
      vacancyForWomen: 0
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
        restrooms: {
          ...state.restrooms,
          rooms: action.payload.response,
          isNoVacancyForMen: checkNoVacantForRestroom(action.payload.response, 'men'),
          isNoVacancyForWomen: checkNoVacantForRestroom(action.payload.response, 'women'),
          vacancyForMen: getVacantCountForRestroom(action.payload.response, 'men'),
          vacancyForWomen: getVacantCountForRestroom(action.payload.response, 'women')
        },
        isFetching: officeInfoIsFetching(state.isFetching, action),
        isError: officrInfoIsError(state.isError, action)
      };
    case OfficeInfoActions.UNAUTHORIZED:
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    case OfficeInfoActions.FAIL_REQUEST:
      return {
        ...state,
        isError: officrInfoIsError(state.isError, action),
        isFetching: officeInfoIsFetching(state.isFetching, action)
      };
    default:
      return state;
  }
}

// トイレの満席チェック
function checkNoVacantForRestroom(rooms, gender) {
  if (!rooms) return true;

  const filteredByGender = rooms.filter(room => room.gender === gender);
  const filteredByUsing = filteredByGender.filter(room => room.isUsing === true);
  return filteredByGender.length === filteredByUsing.length;
}

// トイレの空席数を計算
function getVacantCountForRestroom(rooms, gender) {
  if (!rooms) return 0;

  const filteredByGender = rooms.filter(room => room.gender === gender);
  const filteredByUsing = filteredByGender.filter(room => room.isUsing === false);
  return filteredByUsing.length;
}
