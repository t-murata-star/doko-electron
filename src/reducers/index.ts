import { combineReducers } from 'redux';
import appState from './app';
import userListState from './userInfo/userList';
import officeInfoState from './officeInfo/officeInfo';
import userEditModalState from './userInfo/userEditModal';
import initialStartupModalState from './initialStartupModal';
import settingsState from './settings/settings';

const rootReducer = combineReducers({
  appState,
  userListState,
  officeInfoState,
  userEditModalState,
  initialStartupModalState,
  settingsState
});

export default rootReducer;
