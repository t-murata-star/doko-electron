import { takeEvery, select, put, call, delay } from 'redux-saga/effects';
import { userListSlice, UserListActionsForAsync } from '../../../modules/userInfo/userListModule';
import { RootState } from '../../../modules';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/functions';
import appSlice from '../../../modules/appModule';
import { CallUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse } from '../../../define/model';

function* updateUserInfoOrder(action: ReturnType<typeof UserListActionsForAsync.updateUserInfoOrder>) {
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
    const updateUserInfoResponse: ApiResponse = yield call(CallUserListAPI.updateUserInfo, patchInfoUser, row.getData().id);
    if (updateUserInfoResponse.getIsError()) {
      yield put(userListSlice.actions.reRenderUserList());
      yield put(appSlice.actions.setFetchingStatus(false));
      return;
    }
    yield delay(50);
  }
  yield put(appSlice.actions.setFetchingStatus(false));

  const myUserID = state.appState.myUserID;
  yield call(CallUserListAPI.getUserList, myUserID);
}

export const userListSaga = [takeEvery(UserListActionsForAsync.updateUserInfoOrder.toString(), updateUserInfoOrder)];
