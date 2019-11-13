import { combineReducers } from 'redux';
import userListState from './userList';
import officeInfoState from './officeInfo';
import userEditModal from './userEditModal';
import initialStartupModal from './initialStartupModal';
import settingsState from './settings';

const rootReducer = combineReducers({
  userListState,
  officeInfoState,
  userEditModal,
  initialStartupModal,
  settingsState
});

export default rootReducer;
