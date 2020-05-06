import { all } from 'redux-saga/effects';
import { appSaga } from './logic/appSaga';
import { electronSaga } from './logic/electronSaga';
import { initialStartupModalSaga } from './logic/initialStartupModalSaga';
import { userListSaga } from './logic/userInfo/userListSaga';
import { userEditModalSaga } from './logic/userInfo/userEditModalSaga';
import { menuButtonGroupForUserListSaga } from './logic/userInfo/menuButtonGroupForUserListSaga';
import { settingsSaga } from './logic/settings/settingsSaga';
import { menuButtonGroupForOfficeInfoSaga } from './logic/officeInfo/menuButtonGroupForOfficeInfoSaga';

export default function* rootSaga() {
  yield all([
    ...electronSaga,
    ...appSaga,
    ...initialStartupModalSaga,
    ...userListSaga,
    ...settingsSaga,
    ...userEditModalSaga,
    ...menuButtonGroupForOfficeInfoSaga,
    ...menuButtonGroupForUserListSaga,
  ]);
}
