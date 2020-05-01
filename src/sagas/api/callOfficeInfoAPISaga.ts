import { ApiResponse } from '../../define/model';
import { callAPI } from '../../components/common/functions';
import { put, delay, takeEvery } from 'redux-saga/effects';
import { API_REQUEST_LOWEST_WAIT_TIME_MS } from '../../define';
import { officeInfoSlice } from '../../modules/officeInfo/officeInfoModule';
import { officeInfoAPI } from '../../api/officeInfoAPI';

export const callOfficeInfoAPI = {
  getRestroomUsage: function* () {
    yield put(officeInfoSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(officeInfoAPI.getRestroomUsage);

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
  },

  getOfficeInfo: function* () {
    yield put(officeInfoSlice.actions.startApiRequest());
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(officeInfoAPI.getOfficeInfo);

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
  },
};

export const callOfficeInfoAPISaga = Object.entries(callOfficeInfoAPI).map((value: [string, any]) => {
  return takeEvery(`${officeInfoSlice.name}/api/${value[0]}`, value[1]);
});
