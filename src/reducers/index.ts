import { combineReducers } from 'redux';
import userListState from './userInfo/userList';
import officeInfoState from './officeInfo/officeInfo';
import userEditModal from './userInfo/userEditModal';
import initialStartupModal from './initialStartupModal';
import settingsState from './settings/settings';

const rootReducer = combineReducers({
  userListState,
  officeInfoState,
  userEditModal,
  initialStartupModal,
  settingsState
});

export default rootReducer;
