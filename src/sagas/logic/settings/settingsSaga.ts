import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { ApiResponse, UserInfoForUpdate } from '../../../define/model';
import { settingsSlice, SettingActionsForAsync } from '../../../modules/settings/settingsModule';
import { CallUserListAPI } from '../../api/callUserListAPISaga';
import { showSnackBar } from '../../../components/common/functions';

function* saveSettingsForEmail() {
  const state: RootState = yield select();
  const settingState = state.settingsState;
  const myUserID = state.appState.myUserID;
  const updatedUserInfo: UserInfoForUpdate = {};

  updatedUserInfo['email'] = settingState.user.email;
  const updateUserInfoResponse: ApiResponse = yield call(CallUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
  if (updateUserInfoResponse.getIsError() === false) {
    showSnackBar('success', '設定を保存しました。');
    yield put(settingsSlice.actions.changeDisabledSubmitButtonEmail(true));
  }
}

export const settingsSaga = [takeEvery(SettingActionsForAsync.saveSettingsForEmail.toString(), saveSettingsForEmail)];
