import { createSlice, createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';
import { USER_STATUS_INFO } from '../../define';

class _initialState {
  onHide: boolean = false;
  submitButtonDisabled: boolean = true;
  userID: number = -1;
  userInfo: UserInfo = new UserInfo();
}

// createSlice() で actions と reducers を一気に生成
export const userEditModalSlice = createSlice({
  name: 'userEditModal',
  initialState: new _initialState(),
  reducers: {
    showUserEditModal: (state, action) => {
      return {
        ...state,
        onHide: true,
        userID: action.payload,
      };
    },
    closeUserEditModal: (state) => {
      return {
        ...state,
        onHide: false,
      };
    },
    disableSubmitButton: (state) => {
      return {
        ...state,
        submitButtonDisabled: true,
      };
    },
    enableSubmitButton: (state) => {
      return {
        ...state,
        submitButtonDisabled: false,
      };
    },
    handleChangeUser: (state) => {
      return {
        ...state,
        submitButtonDisabled: true,
      };
    },
    inputClear: (state) => {
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          status: USER_STATUS_INFO.s01.status,
          destination: '',
          return: '',
        },
      };
    },
    changeUserInfo: (state: any, action) => {
      const targetName = action.payload.targetName;
      const targetValue = action.payload.targetValue;
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          [targetName]: targetValue,
        },
      };
    },
    setUserInfo: (state, action) => {
      return {
        ...state,
        userInfo: action.payload,
      };
    },
  },
});

export const userEditModalActionsAsyncLogic = {
  updateUserInfo: createAction(`${userEditModalSlice.name}/logic/updateUserInfo`),
  deleteUser: createAction(`${userEditModalSlice.name}/logic/deleteUser`),
};
