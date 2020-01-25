import { Action, createSlice, Dispatch } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS } from '../../define';
import { ApiResponse, Restroom } from '../../define/model';
import AppModule from '../appModule';

class _initialState {
  isFetching: boolean = false;
  isError: boolean = false;
  restrooms = {
    rooms: new Restroom(),
    isNoVacancyForMen: false,
    isNoVacancyForWomen: false,
    vacancyForMen: -1,
    vacancyForWomen: -1
  };
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'officeInfo',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: state => {
      return {
        ...state,
        isFetching: true
      };
    },
    requestError: state => {
      return {
        ...state,
        isFetching: true,
        isError: true
      };
    },
    failRequest: state => {
      return {
        ...state,
        isFetching: true,
        isError: true
      };
    },
    getRestroomUsageSuccess: (state, action) => {
      return {
        ...state,
        restrooms: {
          ...state.restrooms,
          rooms: action.payload,
          isNoVacancyForMen: checkNoVacantForRestroom(action.payload, 'men'),
          isNoVacancyForWomen: checkNoVacantForRestroom(action.payload, 'women'),
          vacancyForMen: getVacantCountForRestroom(action.payload, 'men'),
          vacancyForWomen: getVacantCountForRestroom(action.payload, 'women')
        },
        isFetching: false,
        isError: false
      };
    },
    returnEmptyRestroomUsage: state => {
      return {
        ...state,
        rooms: []
      };
    }
  }
});

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(AppModule.actions.unauthorized());
      break;

    default:
      break;
  }
};

// スリープ処理
const _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

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

export class AsyncActionsOfficeInfo {
  static getRestroomUsageAction = (sleepMs: number = 0) => {
    return async (dispatch: Dispatch<Action<any>>) => {
      dispatch(slice.actions.startApiRequest());
      try {
        await _sleep(sleepMs);
        const res = await fetch(`${API_URL}/restrooms`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json = await res.json();
        dispatch(slice.actions.getRestroomUsageSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        dispatch(slice.actions.returnEmptyRestroomUsage());
        return new ApiResponse(null, true);
      }
    };
  };
}

export default slice;
