import { combineReducers } from 'redux';
import userList from './userInfo/userListModule';
import officeInfoState from './officeInfo/officeInfoModule';
import userEditModalState from './userInfo/userEditModalMdule';
import initialStartupModal from './initialStartupModalModule';
import app from './appModule';
import settingsState from './settings/settingsModule';

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
