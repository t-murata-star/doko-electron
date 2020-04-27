import { takeEvery, call, put, cancel, select } from 'redux-saga/effects';
import InitialStartupModalSlice, { InitialStartupModalActionsForAsync } from '../../modules/initialStartupModalModule';
import { CallUserListAPI } from '../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate } from '../../define/model';
// import { APP_VERSION, USER_STATUS_INFO } from '../../define';
import { sendHealthCheckSaga, getUserInfo } from '../../components/common/functions';
import { APP_VERSION, USER_STATUS_INFO } from '../../define';
import { RootState } from '../../modules';
import AppSlice from '../../modules/appModule';

const Store = window.require('electron-store');
const electronStore = new Store();

function* addUser() {
  const state: RootState = yield select();
  yield put(
    InitialStartupModalSlice.actions.changeUserInfo({
      targetName: 'version',
      targetValue: APP_VERSION,
    })
  );
  yield put(
    InitialStartupModalSlice.actions.changeUserInfo({
      targetName: 'status',
      targetValue: USER_STATUS_INFO.s01.status,
    })
  );

  const userInfo = state.initialStartupModalState.userInfo;
  const addUserResponse: ApiResponse = yield call(CallUserListAPI.addUser, userInfo);
  if (addUserResponse.getIsError()) {
    yield put(InitialStartupModalSlice.actions.disableSubmitButton(false));
    yield cancel();
  }
  yield closeModal();

  const myUserID = addUserResponse.getPayload().id;

  // userIDを設定ファイルに登録（既に存在する場合は上書き）
  electronStore.set('userID', myUserID);

  // orderパラメータをidと同じ値に更新する
  const addedUserInfo: UserInfoForUpdate = {};
  addedUserInfo.order = myUserID;

  yield call(CallUserListAPI.updateUserInfo, addedUserInfo, myUserID);
  yield call(CallUserListAPI.getUserList, myUserID);
  yield sendHealthCheckSaga();
  yield put(InitialStartupModalSlice.actions.initializeField());
}

function* changeUser() {
  const state: RootState = yield select();
  const myUserID = state.initialStartupModalState.selectedUserId;
  const userList = state.userListState.userList;
  const userInfo = getUserInfo(userList, myUserID);

  if (userInfo === null) {
    return;
  }

  const updatedUserInfo: UserInfoForUpdate = {};
  if (userInfo.version !== APP_VERSION) {
    updatedUserInfo.version = APP_VERSION;
    const updateUserInfoResponse: ApiResponse = yield call(CallUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
    if (updateUserInfoResponse.getIsError()) {
      yield cancel();
    }
  }

  // 状態を「在席」に更新する（更新日時も更新される）
  if (
    userInfo.status === USER_STATUS_INFO.s02.status ||
    userInfo.status === USER_STATUS_INFO.s01.status ||
    userInfo.status === USER_STATUS_INFO.s13.status
  ) {
    updatedUserInfo.status = USER_STATUS_INFO.s01.status;
    updatedUserInfo.name = userInfo.name;
    const updateUserInfoResponse: ApiResponse = yield call(CallUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
    if (updateUserInfoResponse.getIsError()) {
      yield cancel();
    }
  }

  electronStore.set('userID', myUserID);
  yield put(AppSlice.actions.setMyUserId(myUserID));
  yield closeModal();
  yield call(CallUserListAPI.getUserList, myUserID);
  yield sendHealthCheckSaga();
  yield put(InitialStartupModalSlice.actions.initializeField());
}

function* closeModal() {
  yield put(InitialStartupModalSlice.actions.showModal(false));
}

export const InitialStartupModalSaga = [
  takeEvery(InitialStartupModalActionsForAsync.addUser.toString(), addUser),
  takeEvery(InitialStartupModalActionsForAsync.changeUser.toString(), changeUser),
];
