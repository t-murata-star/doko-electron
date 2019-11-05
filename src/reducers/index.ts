import { combineReducers } from 'redux';
import userListState from './userList';
import officeInfoState from './officeInfo';
import userEditModal from './userEditModal';
import initialStartupModal from './initialStartupModal';

const rootReducer = combineReducers({
  userListState,
  officeInfoState,
  userEditModal,
  initialStartupModal
});

export default rootReducer;
