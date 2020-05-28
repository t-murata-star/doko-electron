import { createSlice } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';
import { USER_STATUS_INFO } from '../../define';
import { userEditModalActions } from '../../actions/userInfo/userEditModalActions';

class InitialState {
  onHide: boolean = false;
  disabled: boolean = true;
  userId: number = -1;
  userInfo: UserInfo = new UserInfo();
}

// createSlice() で actions と reducers を一気に生成
export const userEditModalSlice = createSlice({
  name: 'userEditModal',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userEditModalActions.showUserEditModal, (state) => {
        return {
          ...state,
          onHide: true,
        };
      })
      .addCase(userEditModalActions.closeUserEditModal, (state) => {
        return {
          ...state,
          onHide: false,
        };
      })
      .addCase(userEditModalActions.disableSubmitButton, (state) => {
        return {
          ...state,
          disabled: true,
        };
      })
      .addCase(userEditModalActions.enableSubmitButton, (state) => {
        return {
          ...state,
          disabled: false,
        };
      })
      .addCase(userEditModalActions.handleChangeUser, (state) => {
        return {
          ...state,
          disabled: true,
        };
      })
      .addCase(userEditModalActions.inputClear, (state) => {
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            status: USER_STATUS_INFO.s01.status,
            destination: '',
            return: '',
          },
        };
      })
      .addCase(userEditModalActions.changeUserInfo, (state, action) => {
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
      .addCase(userEditModalActions.setUserInfo, (state, action) => {
        return {
          ...state,
          userInfo: action.payload.userInfo,
        };
      });
  },
});
