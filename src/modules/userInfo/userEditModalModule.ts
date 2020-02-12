import { createSlice } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';
import { USER_STATUS } from '../../define';

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
        userID: action.payload[0],
        userInfo: action.payload[1]
      };
    },
    closeUserEditModal: state => {
      return {
        ...state,
        onHide: false
      };
    },
    disableSubmitButton: state => {
      return {
        ...state,
        submitButtonDisabled: true
      };
    },
    enableSubmitButton: state => {
      return {
        ...state,
        submitButtonDisabled: false
      };
    },
    handleChangeUser: state => {
      return {
        ...state,
        submitButtonDisabled: true
      };
    },
    handleEditUser: state => {
      return {
        ...state,
        submitButtonDisabled: true
      };
    },
    inputClear: (state, action) => {
      action.payload['status'] = USER_STATUS.s01;
      action.payload['destination'] = '';
      action.payload['return'] = '';
      return {
        ...state,
        userInfo: action.payload
      };
    },
    changeUserInfo: (state, action) => {
      action.payload[0][action.payload[1]] = action.payload[2];
      return {
        ...state,
        userInfo: action.payload[0]
      };
    }
  }
});

export default slice;
