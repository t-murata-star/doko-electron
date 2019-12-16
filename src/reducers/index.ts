import { combineReducers } from 'redux';
import appState from './app';
import userListState from './userInfo/userList';
import officeInfoState from './officeInfo/officeInfo';
import userEditModal from './userInfo/userEditModal';
import initialStartupModal from './initialStartupModal';
import settingsState from './settings/settings';

const rootReducer = combineReducers({
  appState,
  userListState,
  officeInfoState,
  userEditModal,
  initialStartupModal,
  settingsState
});

export default rootReducer;
