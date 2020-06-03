import { takeEvery, put, call, delay, select } from 'redux-saga/effects';
import { userListActionsAsyncLogic, userListActions } from '../../../actions/userInfo/userListActions';
import { showMessageBoxSyncWithReturnValue } from '../../../components/common/utils';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import { ApiResponse, UpdateUserInfo } from '../../../define/model';
import { appActions } from '../../../actions/appActions';
import { RootState } from '../../../modules';
import { BUTTON_CLICK_OK } from '../../../define';

const userList = {
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
};

export const userListSaga = Object.entries(userList).map((value: [string, any]) => {
  return takeEvery(`userList/logic/${value[0]}`, value[1]);
});
