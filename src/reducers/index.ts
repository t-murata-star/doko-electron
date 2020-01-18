import { combineReducers } from 'redux';
import userListState from './userInfo/userList';
import officeInfoState from './officeInfo/officeInfo';
import userEditModalState from './userInfo/userEditModal';
import initialStartupModal from '../modules/initialStartupModalModule';
import app from '../modules/appModule';
import settingsState from './settings/settings';

const rootReducer = combineReducers({
  appState: app.reducer,
  userListState,
  officeInfoState,
  userEditModalState,
  initialStartupModalState: initialStartupModal.reducer,
  settingsState
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
