import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate } from '../../../define/model';
import $ from 'jquery';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/functions';
import { appActions } from '../../../actions/appActions';
import { userEditModalActions } from '../../../actions/userInfo/userEditModalActions';

const userEditModal = {
  updateUserInfo: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const userInfo = state.userEditModalState.userInfo;
      const userID = state.userEditModalState.userID;

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = userInfo.status;
      updatedUserInfo.destination = userInfo.destination;
      updatedUserInfo.return = userInfo.return;
      updatedUserInfo.message = userInfo.message;
      const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, updatedUserInfo, userID);
      if (updateUserInfoResponse.getIsError()) {
        yield put(userEditModalActions.enableSubmitButton());
        return;
      }

      yield put(userEditModalActions.closeUserEditModal());

      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      const myUserID = state.appState.myUserID;
      yield call(callUserListAPI.getUserListWithMyUserIDExists, myUserID);
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  deleteUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const userInfo = state.userEditModalState.userInfo;

      const index = showMessageBoxSyncWithReturnValue('OK', 'Cancel', '以下のユーザを一覧から削除しますか？\n\n' + userInfo.name);
      if (index !== 0) {
        return;
      }

      const selectedUserId = state.userEditModalState.userInfo.id;
      const deleteUserResponse: ApiResponse = yield call(callUserListAPI.deleteUser, selectedUserId);
      if (deleteUserResponse.getIsError()) {
        return;
      }

      yield put(userEditModalActions.closeUserEditModal());

      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      const myUserID = state.appState.myUserID;
      yield call(callUserListAPI.getUserListWithMyUserIDExists, myUserID);
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const userEditModalSaga = Object.entries(userEditModal).map((value: [string, any]) => {
  return takeEvery(`userEditModal/logic/${value[0]}`, value[1]);
});
