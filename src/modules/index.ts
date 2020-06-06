import { combineReducers } from 'redux';
import { appSlice } from './appModule';
import { initialStartupModalSlice } from './initialStartupModalModule';
import { companyInfoSlice } from './companyInfo/companyInfoModule';
import { settingsSlice } from './settings/settingsModule';
import { userEditModalSlice } from './userInfo/userEditModalModule';
import { userListSlice } from './userInfo/userListModule';

const rootReducer = combineReducers({
  appState: appSlice.reducer,
  userListState: userListSlice.reducer,
  companyInfoState: companyInfoSlice.reducer,
  userEditModalState: userEditModalSlice.reducer,
  initialStartupModalState: initialStartupModalSlice.reducer,
  settingsState: settingsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
