import { createSlice } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';
import { USER_STATUS_INFO } from '../../define';

class _initialState {
  onHide: boolean = false;
  submitButtonDisabled: boolean = true;
  userID: number = -1;
  userInfo: UserInfo = new UserInfo();
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'userEditModal',
  initialState: new _initialState(),
  reducers: {
    showUserEditModal: (state, action) => {
      return {
        ...state,
        onHide: true,
        userID: action.payload.userID,
        userInfo: action.payload.userInfo,
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
    inputClear: (state, action) => {
      action.payload.status = USER_STATUS_INFO.s01.status;
      action.payload.destination = '';
      action.payload.return = '';
      return {
        ...state,
        userInfo: action.payload,
      };
    },
    changeUserInfo: (state, action) => {
      action.payload.userInfo[action.payload.targetName] = action.payload.targetValue;
      return {
        ...state,
        userInfo: action.payload.userInfo,
      };
    },
  },
});

export default slice;
