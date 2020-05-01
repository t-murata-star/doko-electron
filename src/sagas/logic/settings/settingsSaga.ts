import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { ApiResponse, UserInfoForUpdate } from '../../../define/model';
import { settingsSlice } from '../../../modules/settings/settingsModule';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { showSnackBar } from '../../../components/common/functions';

const settings = {
  saveSettingsForEmail: function* () {
    const state: RootState = yield select();
    const settingState = state.settingsState;
    const myUserID = state.appState.myUserID;
    const updatedUserInfo: UserInfoForUpdate = {};

    updatedUserInfo['email'] = settingState.user.email;
    const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
    if (updateUserInfoResponse.getIsError() === false) {
      showSnackBar('success', '設定を保存しました。');
      yield put(settingsSlice.actions.changeDisabledSubmitButtonEmail(true));
    }
  },
};

export const settingsSaga = Object.entries(settings).map((value: [string, any]) => {
  return takeEvery(`${settingsSlice.name}/logic/${value[0]}`, value[1]);
});
