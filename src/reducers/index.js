import { combineReducers } from 'redux';
import userListState from './userList';
import menuButtonGroup from './menuButtonGroup';
import userEditModal from './userEditModal';
import initialStartupModal from './initialStartupModal';

const rootReducer = combineReducers({
  userListState,
  menuButtonGroup,
  userEditModal,
  initialStartupModal
});

export default rootReducer;
