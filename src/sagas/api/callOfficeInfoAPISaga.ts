import { ApiResponse } from '../../define/model';
import { callAPI } from '../../components/common/functions';
import { put, delay } from 'redux-saga/effects';
import { API_REQUEST_LOWEST_WAIT_TIME_MS } from '../../define';
import { officeInfoSlice } from '../../modules/officeInfo/officeInfoModule';
import { OfficeInfoAPI } from '../../api/officeInfoAPI';

export class CallOfficeInfoAPI {
  static getRestroomUsage = function* () {
    yield put(officeInfoSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(OfficeInfoAPI.getRestroomUsage);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      yield put(officeInfoSlice.actions.failRequest());
    } else {
      yield put(officeInfoSlice.actions.getRestroomUsageSuccess(response));
    }
    return response;
  };

  static getOfficeInfo = function* () {
    yield put(officeInfoSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(OfficeInfoAPI.getOfficeInfo);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      yield put(officeInfoSlice.actions.failRequest());
    } else {
      yield put(officeInfoSlice.actions.getOfficeInfoSuccess(response));
    }
    return response;
  };
}
