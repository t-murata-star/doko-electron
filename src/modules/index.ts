import { combineReducers } from 'redux';
import app from './appModule';
import initialStartupModal from './initialStartupModalModule';
import officeInfoState from './officeInfo/officeInfoModule';
import settingsState from './settings/settingsModule';
import userEditModalState from './userInfo/userEditModalMdule';
import userList from './userInfo/userListModule';

const rootReducer = combineReducers({
  appState: app.reducer,
  userListState: userList.reducer,
  officeInfoState: officeInfoState.reducer,
  userEditModalState: userEditModalState.reducer,
  initialStartupModalState: initialStartupModal.reducer,
  settingsState: settingsState.reducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
