import { takeEvery, select, put, call, delay } from 'redux-saga/effects';
import { userListActionsAsyncLogic, userListActions } from '../../../actions/userInfo/userListActions';
import { RootState } from '../../../modules';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/utils';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse } from '../../../define/model';
import { appActions } from '../../../actions/appActions';

const userList = {
  updateUserInfoOrder: function* (action: ReturnType<typeof userListActionsAsyncLogic.updateUserInfoOrder>) {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const rowComponent = action.payload.rowComponent;
      const rows = rowComponent.getTable().getRows();
      const index = showMessageBoxSyncWithReturnValue(
        'OK',
        'Cancel',
        `並べ替えてよろしいですか？\n※表示順序は全てのユーザで共通です。`
      );

      if (index !== 0) {
        yield put(userListActions.reRenderUserList());
        return;
      }

      yield put(appActions.setFetchingStatus(true));

      for (const row of rows) {
        const patchInfoUser = { order: row.getPosition(true) + 1 };
        const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, patchInfoUser, row.getData().id);
        if (updateUserInfoResponse.getIsError()) {
          yield put(userListActions.reRenderUserList());
          yield put(appActions.setFetchingStatus(false));
          return;
        }
        yield delay(50);
      }
      yield put(appActions.setFetchingStatus(false));

      const myUserID = state.appState.myUserID;
      yield call(callUserListAPI.getUserList, myUserID);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const userListSaga = Object.entries(userList).map((value: [string, any]) => {
  return takeEvery(`userList/logic/${value[0]}`, value[1]);
});
