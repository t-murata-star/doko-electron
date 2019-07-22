import { combineReducers } from 'redux';
import employeeList from './userList'
import menuButtonGroup from './menuButtonGroup'

const rootReducer = combineReducers({
  employeeList,
  menuButtonGroup,
});

export default rootReducer;
