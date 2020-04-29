import { all } from 'redux-saga/effects';
import { appSaga } from './logic/appSaga';
import { initialStartupModalSaga } from './logic/initialStartupModalSaga';

export default function* rootSaga() {
  yield all([...appSaga, ...initialStartupModalSaga]);
}
