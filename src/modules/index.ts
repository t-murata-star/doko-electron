import { combineReducers } from 'redux';
import app from './appModule';
import { initialStartupModalSlice } from './initialStartupModalModule';
import { officeInfoSlice } from './officeInfo/officeInfoModule';
import { settingsSlice } from './settings/settingsModule';
import { userEditModalSlice } from './userInfo/userEditModalModule';
import { userListSlice } from './userInfo/userListModule';

const rootReducer = combineReducers({
  appState: app.reducer,
  userListState: userListSlice.reducer,
  officeInfoState: officeInfoSlice.reducer,
  userEditModalState: userEditModalSlice.reducer,
  initialStartupModalState: initialStartupModalSlice.reducer,
  settingsState: settingsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
