import { takeEvery, all, call, put } from 'redux-saga/effects';
import { callOfficeInfoAPI } from '../../api/callOfficeInfoAPISaga';
import { appActions } from '../../../actions/appActions';

const menuButtonGroupForOfficeInfo = {
  getAllOfficeInfo: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      yield all([call(callOfficeInfoAPI.getRestroomUsage), call(callOfficeInfoAPI.getOfficeInfo)]);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const menuButtonGroupForOfficeInfoSaga = Object.entries(menuButtonGroupForOfficeInfo).map((value: [string, any]) => {
  return takeEvery(`menuButtonGroupForOfficeInfo/logic/${value[0]}`, value[1]);
});
