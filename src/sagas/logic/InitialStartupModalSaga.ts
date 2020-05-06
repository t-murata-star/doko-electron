import { takeEvery, call, put, select } from 'redux-saga/effects';
import { callUserListAPI } from '../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate } from '../../define/model';
// import { APP_VERSION, USER_STATUS_INFO } from '../../define';
import { getUserInfo } from '../../components/common/functions';
import { APP_VERSION, USER_STATUS_INFO } from '../../define';
import { RootState } from '../../modules';
import { callAppAPI } from '../api/callAppAPISaga';
import { appActions } from '../../actions/appActions';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';

const Store = window.require('electron-store');
const electronStore = new Store();

const initialStartupModal = {
  addUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      yield put(initialStartupModalActions.changeUserInfo('version', APP_VERSION));
      yield put(initialStartupModalActions.changeUserInfo('status', USER_STATUS_INFO.s01.status));

      const userInfo = state.initialStartupModalState.userInfo;
      const addUserResponse: ApiResponse = yield call(callUserListAPI.addUser, userInfo);
      if (addUserResponse.getIsError()) {
        yield put(initialStartupModalActions.disableSubmitButton(false));
        return;
      }
      const myUserID = addUserResponse.getPayload().id;

      // userIDを設定ファイルに登録（既に存在する場合は上書き）
      electronStore.set('userID', myUserID);

      // orderパラメータをidと同じ値に更新する
      const addedUserInfo: UserInfoForUpdate = {};
      addedUserInfo.order = myUserID;

      yield call(callUserListAPI.updateUserInfo, addedUserInfo, myUserID);
      yield call(callUserListAPI.getUserList, myUserID);

      yield put(appActions.setMyUserId(myUserID));
      yield closeModal();

      yield call(callAppAPI.sendHealthCheck);
      yield put(initialStartupModalActions.initializeField());
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  changeUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
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
        const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
        if (updateUserInfoResponse.getIsError()) {
          return;
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
        const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserID);
        if (updateUserInfoResponse.getIsError()) {
          return;
        }
      }

      electronStore.set('userID', myUserID);
      yield put(appActions.setMyUserId(myUserID));
      yield closeModal();
      yield call(callUserListAPI.getUserList, myUserID);
      yield call(callAppAPI.sendHealthCheck);
      yield put(initialStartupModalActions.initializeField());
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  selectFromExistingUsers: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      yield put(initialStartupModalActions.initializeField());
      yield put(initialStartupModalActions.disableSubmitButton(true));
      yield put(initialStartupModalActions.changeSubmitMode(true));
      yield call(callUserListAPI.getUserList, -1);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

function* closeModal() {
  yield put(initialStartupModalActions.showModal(false));
}

export const initialStartupModalSaga = Object.entries(initialStartupModal).map((value: [string, any]) => {
  return takeEvery(`initialStartupModal/logic/${value[0]}`, value[1]);
});
