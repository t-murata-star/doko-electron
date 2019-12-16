import * as OfficeInfoActions from '../../actions/officeInfo/officeInfo';
import { Restroom, RequestError } from '../../define/model';

export class _OfficeInfoState {
  isFetching: boolean = false;
  isError: RequestError = new RequestError();
  restrooms = {
    rooms: new Restroom(),
    isNoVacancyForMen: false,
    isNoVacancyForWomen: false,
    vacancyForMen: -1,
    vacancyForWomen: -1
  };
}

export function officeInfoIsFetching(action: any) {
  switch (action.type) {
    case OfficeInfoActions.GET_RESTROOM_USAGE:
      return true;
    default:
      return false;
  }
}

export function officrInfoIsError(state = new RequestError(), action: any) {
  switch (action.type) {
    case OfficeInfoActions.REQUEST_ERROR:
      return {
        ...state,
        status: true,
        code: action.payload.statusCode,
        text: action.payload.statusText
      };
    case OfficeInfoActions.FAIL_REQUEST:
      return {
        ...state,
        status: true,
        code: null,
        text: action.payload.statusText
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
export default function officeInfoState(state = new _OfficeInfoState(), action: any) {
  switch (action.type) {
    case OfficeInfoActions.GET_RESTROOM_USAGE:
      return {
        ...state,
        isFetching: officeInfoIsFetching(action)
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
        isFetching: officeInfoIsFetching(action),
        isError: officrInfoIsError(state.isError, action)
      };
    case OfficeInfoActions.FAIL_REQUEST:
      return {
        ...state,
        isError: officrInfoIsError(state.isError, action),
        isFetching: officeInfoIsFetching(action)
      };
    case OfficeInfoActions.REQUEST_ERROR:
      return {
        ...state,
        isError: officrInfoIsError(state.isError, action),
        isFetching: officeInfoIsFetching(action)
      };
    case OfficeInfoActions.RETURN_EMPTY_RESTROOM_USAGE:
      return {
        ...state,
        restrooms: {
          ...state.restrooms,
          rooms: action.rooms,
          isNoVacancyForMen: false,
          isNoVacancyForWomen: false,
          vacancyForMen: -1,
          vacancyForWomen: -1
        }
      };
    default:
      return state;
  }
}

// トイレの満席チェック
function checkNoVacantForRestroom(rooms: Restroom[], gender: string) {
  if (!rooms) return true;

  const filteredByGender = rooms.filter(room => room.gender === gender);
  const filteredByUsing = filteredByGender.filter(room => room.isUsing === true);
  return filteredByGender.length === filteredByUsing.length;
}

// トイレの空席数を計算
function getVacantCountForRestroom(rooms: Restroom[], gender: string) {
  if (!rooms) return 0;

  const filteredByGender = rooms.filter(room => room.gender === gender);
  const filteredByUsing = filteredByGender.filter(room => room.isUsing === false);
  return filteredByUsing.length;
}
