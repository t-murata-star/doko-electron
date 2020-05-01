import { all } from 'redux-saga/effects';
import { appSaga } from './logic/appSaga';
import { initialStartupModalSaga } from './logic/initialStartupModalSaga';
import { userListSaga } from './logic/userInfo/userListSaga';
import { userEditModalSaga } from './logic/userInfo/userEditModalSaga';
import { settingsSaga } from './logic/settings/settingsSaga';
import { callAppAPISaga } from './api/callAppAPISaga';
import { callUserListAPISaga } from './api/callUserListAPISaga';
import { callOfficeInfoAPISaga } from './api/callOfficeInfoAPISaga';

export default function* rootSaga() {
  yield all([
    ...[...appSaga, ...initialStartupModalSaga, ...userListSaga, ...settingsSaga, ...userEditModalSaga],
    ...[...callAppAPISaga, ...callUserListAPISaga, ...callOfficeInfoAPISaga],
  ]);
}
