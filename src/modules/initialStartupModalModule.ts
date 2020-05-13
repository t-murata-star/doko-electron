import { createSlice } from '@reduxjs/toolkit';
import { UserInfo } from '../define/model';
import { initialStartupModalActions } from '../actions/initialStartupModalActions';

class InitialState {
  onHide: boolean = false;
  isChangeUser: boolean = false;
  disabled: boolean = true;
  userInfo: UserInfo = new UserInfo();
  selectedUserId: number = -1;
}

// createSlice() で actions と reducers を一気に生成
export const initialStartupModalSlice = createSlice({
  name: 'initialStartupModal',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initialStartupModalActions.showModal, (state, action) => {
        return {
          ...state,
          onHide: action.payload.onHide,
        };
      })
      .addCase(initialStartupModalActions.disableSubmitButton, (state, action) => {
        return {
          ...state,
          disabled: action.payload.disabled,
        };
      })
      .addCase(initialStartupModalActions.changeSubmitMode, (state, action) => {
        return {
          ...state,
          isChangeUser: action.payload.isChangeUser,
        };
      })
      .addCase(initialStartupModalActions.initializeState, () => {
        return new InitialState();
      })
      .addCase(initialStartupModalActions.changeUserInfo, (state, action) => {
        const targetName = action.payload.targetName;
        const targetValue = action.payload.targetValue;
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            [targetName]: targetValue,
          },
        };
      })
      .addCase(initialStartupModalActions.changeUserId, (state, action) => {
        return {
          ...state,
          selectedUserId: action.payload.selectedUserId,
        };
      })
      .addCase(initialStartupModalActions.initializeField, (state) => {
        return {
          ...state,
          userInfo: new UserInfo(),
          selectedUserId: -1,
        };
      });
  },
});
