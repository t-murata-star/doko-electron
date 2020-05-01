import { createSlice, createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../define/model';

class _initialState {
  onHide: boolean = false;
  isChangeUser: boolean = false;
  submitButtonDisabled: boolean = true;
  userInfo: UserInfo = new UserInfo();
  selectedUserId: number = -1;
}

// createSlice() で actions と reducers を一気に生成
export const initialStartupModalSlice = createSlice({
  name: 'initialStartupModal',
  initialState: new _initialState(),
  reducers: {
    showModal: (state, action) => {
      return {
        ...state,
        onHide: action.payload,
      };
    },
    disableSubmitButton: (state, action) => {
      return {
        ...state,
        submitButtonDisabled: action.payload,
      };
    },
    changeSubmitMode: (state, action) => {
      return {
        ...state,
        isChangeUser: action.payload,
      };
    },
    initializeState: () => {
      return new _initialState();
    },
    changeUserInfo: (state: any, action) => {
      const targetName = action.payload.targetName;
      const targetValue = action.payload.targetValue;
      state.userInfo[targetName] = targetValue;
      return {
        ...state,
      };
    },
    changeUserId: (state, action) => {
      return {
        ...state,
        selectedUserId: action.payload,
      };
    },
    initializeField: (state) => {
      return {
        ...state,
        userInfo: new UserInfo(),
        selectedUserId: -1,
      };
    },
  },
});

export const initialStartupModalActionsAsyncLogic = {
  addUser: createAction(`${initialStartupModalSlice.name}/logic/addUser`),
  changeUser: createAction(`${initialStartupModalSlice.name}/logic/changeUser`),
};
