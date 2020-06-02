import { takeEvery, put, call, delay, select } from 'redux-saga/effects';
import { userListActionsAsyncLogic, userListActions } from '../../../actions/userInfo/userListActions';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/utils';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UpdateUserInfo } from '../../../define/model';
import { appActions } from '../../../actions/appActions';
import { RootState } from '../../../modules';

const userList = {
  updateUserInfoOrder: function* (action: ReturnType<typeof userListActionsAsyncLogic.updateUserInfoOrder>) {
    try {
      const state: RootState = yield select();
      yield put(appActions.isShowLoadingPopup(true));
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

      for (const row of rows) {
        const updatedUserInfo = { order: row.getPosition(true) + 1 };
        const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
          callUserListAPI.updateUserInfo,
          updatedUserInfo,
          row.getData().id
        );
        if (updateUserInfoResponse.getIsError()) {
          yield put(userListActions.reRenderUserList());
          return;
        }
        const delayMs = 30;
        yield delay(delayMs);
      }

      const myUserId = state.appState.myUserId;
      yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
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
