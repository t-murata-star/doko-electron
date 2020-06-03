import { createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';

export const userListActions = {
  getUserListSuccess: createAction(`userList/getUserListSuccess`, (userList: UserInfo[]) => {
    return {
      payload: {
        userList,
      },
    };
  }),
  updateUserInfoSuccess: createAction(`userList/updateUserInfoSuccess`),
  updateHealthCheckSuccess: createAction(`userList/updateHealthCheckSuccess`),
  updateAppVersionSuccess: createAction(`userList/updateAppVersionSuccess`),
  changeOrderSuccess: createAction(`userList/changeOrderSuccess`),
  addUserSuccess: createAction(`userList/addUserSuccess`),
  deleteUserSuccess: createAction(`userList/deleteUserSuccess`),
  selectUser: createAction(`userList/selectUser`, (selectedUserId: number) => {
    return {
      payload: {
        selectedUserId,
      },
    };
  }),
  inoperable: createAction(`userList/inoperable`, (inoperable: boolean) => {
    return {
      payload: {
        inoperable,
      },
    };
  }),
  reRenderUserList: createAction(`userList/reRenderUserList`),
  updateUserInfoState: createAction(`userList/updateUserInfoState`, (userId: number, userInfo: UserInfo) => {
    return {
      payload: {
        userId,
        userInfo,
      },
    };
  }),
};

export const userListActionsAsyncLogic = {
  updateUserInfoOrder: createAction(`userList/logic/updateUserInfoOrder`, (rowComponent: Tabulator.RowComponent) => {
    return {
      payload: {
        rowComponent,
      },
    };
  }),
};
