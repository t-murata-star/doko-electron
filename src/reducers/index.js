import { combineReducers } from 'redux';
import userList from './userList'
import menuButtonGroup from './menuButtonGroup'
import userEditModal from './userEditModal'
import initialStartupModal from './initialStartupModal'

const rootReducer = combineReducers({
  userList,
  menuButtonGroup,
  userEditModal,
  initialStartupModal,
});

export default rootReducer;
