import { takeEvery, call, select, put } from 'redux-saga/effects';
import { callUserListAPI } from '../../sagas/api/callUserListAPISaga';
import { getUserInfo } from '../../components/common/utils';
import { USER_STATUS_INFO } from '../../define';
import { UserInfoForUpdate } from '../../define/model';
import { RootState } from '../../modules';
import { appActions } from '../../actions/appActions';

const { remote } = window.require('electron');

const electron = {
  electronLockScreenEvent: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserID = state.appState.myUserID;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserID);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = USER_STATUS_INFO.s13.status;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  electronUnlockScreenEvent: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserID = state.appState.myUserID;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserID);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = USER_STATUS_INFO.s01.status;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  closeApp: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserID = state.appState.myUserID;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserID);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        closeApp();
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.status = USER_STATUS_INFO.s02.status;
      updatedUserInfo.name = userInfo.name;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
      closeApp();
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

const closeApp = () => {
  if (remote.getCurrentWindow().isDestroyed() === false) {
    remote.getCurrentWindow().destroy();
  }
};

export const electronSaga = Object.entries(electron).map((value: [string, any]) => {
  return takeEvery(`electron/logic/${value[0]}`, value[1]);
});
