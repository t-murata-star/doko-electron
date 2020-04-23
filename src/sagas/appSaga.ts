import { takeEvery, put } from 'redux-saga/effects';
import AppSlice, { AsyncActionsApp } from '../modules/appModule';
import { AppAPI } from '../api/appAPI';
import { callAPI, showSnackBar } from '../components/common/functions';
// import { Action } from '../define/model';

function* login() {
  try {
    const payload = yield callAPI(AppAPI.login);
    yield put(AppSlice.actions.loginSuccess(payload));
  } catch (error) {
    showSnackBar('error');
  }
}

export const appSaga = [takeEvery(AsyncActionsApp.login.toString(), login)];
