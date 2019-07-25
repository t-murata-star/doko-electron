import { combineReducers } from 'redux';
import userList from './userList'
import menuButtonGroup from './menuButtonGroup'
import userEditModal from './userEditModal'

const rootReducer = combineReducers({
  userList,
  menuButtonGroup,
  userEditModal,
});

export default rootReducer;
