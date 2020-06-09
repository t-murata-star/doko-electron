import { takeEvery, put, call, delay, select } from 'redux-saga/effects';
import $ from 'jquery';
import { userListActionsAsyncLogic, userListActions } from '../../../actions/userInfo/userListActions';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/utils';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UpdateUserInfo, UserInfoForUpdate, UserInfo, DeleteUser } from '../../../define/model';
import { appActions } from '../../../actions/appActions';
import { RootState } from '../../../modules';
import { BUTTON_CLICK_OK } from '../../../define';
import { sleepLowestWaitTime } from '../../common/utilsSaga';
import { userEditModalActions } from '../../../actions/userInfo/userEditModalActions';

const userList = {
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

  updateUserInfoOrder: function* (action: ReturnType<typeof userListActionsAsyncLogic.updateUserInfoOrder>) {
    try {
      const NETX_ORDER = 1;
      const DELAY_TIME_MS = 30;
      const state: RootState = yield select();
      yield put(appActions.isShowLoadingPopup(true));
      const rowComponent = action.payload.rowComponent;
      const rows = rowComponent.getTable().getRows();
      const index = showMessageBoxSyncWithReturnValue(
        'OK',
        'Cancel',
        `並べ替えてよろしいですか？\n※表示順序は全てのユーザで共通です。`
      );

      if (index !== BUTTON_CLICK_OK) {
        yield put(userListActions.reRenderUserList());
        return;
      }

      for (const row of rows) {
        const updatedUserInfo = { order: row.getPosition(true) + NETX_ORDER };
        const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
          callUserListAPI.changeOrder,
          updatedUserInfo,
          row.getData().id
        );
        if (updateUserInfoResponse.getIsError()) {
          yield put(userListActions.reRenderUserList());
          return;
        }
        yield delay(DELAY_TIME_MS);
      }

      const myUserId = state.appState.myUserId;
      yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  reload: function* () {
    const processStartTime = Date.now();
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const SCROLL_TOP = 0;
      const state: RootState = yield select();
      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
      const myUserId = state.appState.myUserId;
      yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || SCROLL_TOP);
    } catch (error) {
      console.error(error);
    } finally {
      yield call(sleepLowestWaitTime, processStartTime);
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const userListSaga = Object.entries(userList).map((value: [string, any]) => {
  return takeEvery(`userList/logic/${value[0]}`, value[1]);
});
