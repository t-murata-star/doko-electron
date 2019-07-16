import { combineReducers } from 'redux';
import employeeList from './employeeList'
import menuButtonGroup from './menuButtonGroup'

const rootReducer = combineReducers({
  employeeList,
  menuButtonGroup,
});

export default rootReducer;
