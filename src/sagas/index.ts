import { all } from 'redux-saga/effects';
import { appSaga } from './logic/appSaga';
import { electronSaga } from './logic/electronSaga';
import { initialStartupModalSaga } from './logic/initialStartupModalSaga';
import { userListSaga } from './logic/userInfo/userListSaga';
import { settingsSaga } from './logic/settings/settingsSaga';
import { companyInfoSaga } from './logic/companyInfo/companyInfoSaga';

export default function* rootSaga() {
  yield all([...electronSaga, ...appSaga, ...initialStartupModalSaga, ...userListSaga, ...settingsSaga, ...companyInfoSaga]);
}
