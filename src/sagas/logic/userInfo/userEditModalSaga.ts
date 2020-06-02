import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate, UpdateUserInfo, DeleteUser, UserInfo } from '../../../define/model';
import $ from 'jquery';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/utils';
import { appActions } from '../../../actions/appActions';
import { userEditModalActions } from '../../../actions/userInfo/userEditModalActions';
import { userListActions } from '../../../actions/userInfo/userListActions';
import { BUTTON_CLICK_OK } from '../../../define';

const userEditModal = {
  updateUserInfo: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const SCROLL_TOP = 0;
      const state: RootState = yield select();
      const userInfo = state.userEditModalState.userInfo;
      const userId = userInfo.id;

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = userInfo.status;
      updatedUserInfo.destination = userInfo.destination;
      updatedUserInfo.return = userInfo.return;
      updatedUserInfo.message = userInfo.message;
      const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
        callUserListAPI.updateUserInfo,
        updatedUserInfo,
        userId
      );
      if (updateUserInfoResponse.getIsError()) {
        yield put(userEditModalActions.enableSubmitButton());
        return;
      }

      // ローカルのstate（userList）を更新する
      const updatedUserInfoState: UserInfo = { ...state.userEditModalState.userInfo };
      updatedUserInfoState.updatedAt = updateUserInfoResponse.getPayload().updatedAt;
      yield put(userListActions.updateUserInfoState(userId, updatedUserInfoState));
      yield put(userEditModalActions.closeUserEditModal());

      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || SCROLL_TOP);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  deleteUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const SCROLL_TOP = 0;
      const state: RootState = yield select();
      const userInfo = state.userEditModalState.userInfo;

      const index = showMessageBoxSyncWithReturnValue('OK', 'Cancel', `以下のユーザを一覧から削除しますか？\n\n${userInfo.name}`);
      if (index !== BUTTON_CLICK_OK) {
        return;
      }

      const selectedUserId = state.userEditModalState.userInfo.id;
      const deleteUserResponse: ApiResponse<DeleteUser> = yield call(callUserListAPI.deleteUser, selectedUserId);
      if (deleteUserResponse.getIsError()) {
        return;
      }

      yield put(userEditModalActions.closeUserEditModal());

      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      const myUserId = state.appState.myUserId;
      yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || SCROLL_TOP);
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
