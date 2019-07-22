import { combineReducers } from 'redux';
import employeeList from './userList'
import menuButtonGroup from './menuButtonGroup'
import userEdit from './userEdit'

const rootReducer = combineReducers({
  employeeList,
  menuButtonGroup,
  userEdit,
});

export default rootReducer;
