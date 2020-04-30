import { takeEvery, select, put, call } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { CallUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate } from '../../../define/model';
import { UserEditModalActionsForAsync, userEditModalSlice } from '../../../modules/userInfo/userEditModalModule';
import $ from 'jquery';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/functions';

function* updateUserInfo() {
  const state: RootState = yield select();
  const userInfo = state.userEditModalState.userInfo;
  const userID = state.userEditModalState.userID;

  const updatedUserInfo: UserInfoForUpdate = {};
  updatedUserInfo.name = userInfo.name;
  updatedUserInfo.status = userInfo.status;
  updatedUserInfo.destination = userInfo.destination;
  updatedUserInfo.return = userInfo.return;
  updatedUserInfo.message = userInfo.message;
  const updateUserInfoResponse: ApiResponse = yield call(CallUserListAPI.updateUserInfo, updatedUserInfo, userID);
  if (updateUserInfoResponse.getIsError()) {
    yield put(userEditModalSlice.actions.enableSubmitButton());
    return;
  }

  yield put(userEditModalSlice.actions.closeUserEditModal());

  const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
  const myUserID = state.appState.myUserID;
  yield call(CallUserListAPI.getUserListWithMyUserIDExists, myUserID);
  $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
}

function* deleteUser() {
  const state: RootState = yield select();
  const userInfo = state.userEditModalState.userInfo;

  const index = showMessageBoxSyncWithReturnValue('OK', 'Cancel', '以下のユーザを一覧から削除しますか？\n\n' + userInfo.name);
  if (index !== 0) {
    return;
  }

  const selectedUserId = state.userEditModalState.userInfo.id;
  const deleteUserResponse: ApiResponse = yield call(CallUserListAPI.deleteUser, selectedUserId);
  if (deleteUserResponse.getIsError()) {
    return;
  }

  yield put(userEditModalSlice.actions.closeUserEditModal());

  const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
  const myUserID = state.appState.myUserID;
  yield call(CallUserListAPI.getUserListWithMyUserIDExists, myUserID);
  $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
}

export const userEditModalSaga = [
  takeEvery(UserEditModalActionsForAsync.updateUserInfo.toString(), updateUserInfo),
  takeEvery(UserEditModalActionsForAsync.deleteUser.toString(), deleteUser),
];
