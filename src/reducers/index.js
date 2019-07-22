import { combineReducers } from 'redux';
import userList from './userList'
import menuButtonGroup from './menuButtonGroup'
import userEdit from './userEdit'

const rootReducer = combineReducers({
  userList,
  menuButtonGroup,
  userEdit,
});

export default rootReducer;
