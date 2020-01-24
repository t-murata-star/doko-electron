import { createSlice } from '@reduxjs/toolkit';
import { UserInfo } from '../define/model';

class _initialState {
  onHide: boolean = false;
  isChangeUser: boolean = false;
  submitButtonDisabled: boolean = true;
  userID: number = -1;
  userInfo: UserInfo = new UserInfo();
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'initialStartupModal',
  initialState: new _initialState(),
  reducers: {
    showModal: (state, action) => {
      return {
        ...state,
        onHide: action.payload
      };
    },
    disableSubmitButton: (state, action) => {
      return {
        ...state,
        submitButtonDisabled: action.payload
      };
    },
    changeSubmitMode: (state, action) => {
      return {
        ...state,
        isChangeUser: action.payload
      };
    },
    setUserInfo: (state, action) => {
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          [action.payload[0]]: action.payload[1]
        }
      };
    },
    setUserId: (state, action) => {
      return {
        ...state,
        userID: action.payload
      };
    }
  }
});

export default slice;
