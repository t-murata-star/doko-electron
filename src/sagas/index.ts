import { all } from 'redux-saga/effects';
import { appSaga } from './logic/appSaga';
import { InitialStartupModalSaga } from './logic/InitialStartupModalSaga';

export default function* rootSaga() {
  yield all([...appSaga, ...InitialStartupModalSaga]);
}
