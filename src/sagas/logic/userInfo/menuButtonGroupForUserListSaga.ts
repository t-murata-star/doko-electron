import { takeEvery, select, call, put } from 'redux-saga/effects';
import { RootState } from '../../../modules';
import { callUserListAPI } from '../../api/callUserListAPISaga';
import $ from 'jquery';
import { appActions } from '../../../actions/appActions';

const menuButtonGroupForUserList = {
  reload: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
      // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
      const myUserID = state.appState.myUserID;
      yield call(callUserListAPI.getUserList, myUserID);
      $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

export const menuButtonGroupForUserListSaga = Object.entries(menuButtonGroupForUserList).map((value: [string, any]) => {
  return takeEvery(`menuButtonGroupForUserList/logic/${value[0]}`, value[1]);
});
