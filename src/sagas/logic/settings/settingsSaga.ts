import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { ApiResponse, UserInfoForUpdate, UpdateUserInfo } from '../../../define/model';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { showSnackBar } from '../../../components/common/utils';
import { appActions } from '../../../actions/appActions';
import { settingActions } from '../../../actions/settings/settingsActions';

const settings = {
  // メールアドレスの保存
  saveSettingsForEmail: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const settingState = state.settingsState;
      const myUserId = state.appState.myUserId;
      const updatedUserInfo: UserInfoForUpdate = {};

      updatedUserInfo.email = settingState.user.email;
      const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
        callUserListAPI.updateUserInfo,
        updatedUserInfo,
        myUserId
      );
      if (updateUserInfoResponse.getIsError() === false) {
        showSnackBar('success', '設定を保存しました。');
        yield put(settingActions.changeDisabledSubmitButtonEmail(true));
      }
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const settingsSaga = Object.entries(settings).map((value: [string, any]) => {
  return takeEvery(`settings/logic/${value[0]}`, value[1]);
});
