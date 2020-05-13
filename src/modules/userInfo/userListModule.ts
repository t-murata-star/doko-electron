import { createSlice } from '@reduxjs/toolkit';
import { userListActions } from '../../actions/userInfo/userListActions';
import { getUserListIndexBasedOnUserID } from '../../components/common/utils';
import { UserInfo } from '../../define/model';

class InitialState {
  userList: UserInfo[] = [];
  selectedUserId: number = -1; // ユーザ一覧画面で編集中のユーザのIDを格納する
  inoperable: boolean = false;
}

// createSlice() で actions と reducers を一気に生成
export const userListSlice = createSlice({
  name: 'userList',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userListActions.getUserListSuccess, (state, action) => {
        return {
          ...state,
          userList: action.payload.userList,
        };
      })
      .addCase(userListActions.updateUserInfoSuccess, (state) => {
        return {
          ...state,
        };
      })
      .addCase(userListActions.addUserSuccess, (state) => {
        return {
          ...state,
        };
      })
      .addCase(userListActions.deleteUserSuccess, (state) => {
        return {
          ...state,
        };
      })
      .addCase(userListActions.selectUser, (state, action) => {
        return {
          ...state,
          selectedUserId: action.payload.selectedUserId,
        };
      })
      .addCase(userListActions.inoperable, (state, action) => {
        return {
          ...state,
          inoperable: action.payload.inoperable,
        };
      })
      .addCase(userListActions.reRenderUserList, (state) => {
        return {
          ...state,
          userList: JSON.parse(JSON.stringify(state.userList)),
        };
      })
      .addCase(userListActions.updateUserInfoState, (state, action) => {
        const userList: UserInfo[] = [...state.userList];
        const index = getUserListIndexBasedOnUserID(userList, action.payload.userID);
        userList[index] = action.payload.userInfo;
        return {
          ...state,
          userList,
        };
      });
  },
});
