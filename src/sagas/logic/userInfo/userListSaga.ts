import { takeEvery, select, put, call, delay } from 'redux-saga/effects';
import { userListSlice, userListActionsAsyncLogic } from '../../../modules/userInfo/userListModule';
import { RootState } from '../../../modules';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/functions';
import { appSlice } from '../../../modules/appModule';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse } from '../../../define/model';

const userList = {
  updateUserInfoOrder: function* (action: ReturnType<typeof userListActionsAsyncLogic.updateUserInfoOrder>) {
    const state: RootState = yield select();

    const rowComponent = action.payload.rowComponent;
    const rows = rowComponent.getTable().getRows();
    const index = showMessageBoxSyncWithReturnValue(
      'OK',
      'Cancel',
      `並べ替えてよろしいですか？\n※表示順序は全てのユーザで共通です。`
    );

    if (index !== 0) {
      yield put(userListSlice.actions.reRenderUserList());
      return;
    }

    yield put(appSlice.actions.setFetchingStatus(true));

    for (const row of rows) {
      const patchInfoUser = { order: row.getPosition(true) + 1 };
      const updateUserInfoResponse: ApiResponse = yield call(callUserListAPI.updateUserInfo, patchInfoUser, row.getData().id);
      if (updateUserInfoResponse.getIsError()) {
        yield put(userListSlice.actions.reRenderUserList());
        yield put(appSlice.actions.setFetchingStatus(false));
        return;
      }
      yield delay(50);
    }
    yield put(appSlice.actions.setFetchingStatus(false));

    const myUserID = state.appState.myUserID;
    yield call(callUserListAPI.getUserList, myUserID);
  },
};

export const userListSaga = Object.entries(userList).map((value: [string, any]) => {
  return takeEvery(`${userListSlice.name}/logic/${value[0]}`, value[1]);
});
