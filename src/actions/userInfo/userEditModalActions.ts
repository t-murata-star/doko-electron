import { createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';

export const userEditModalActions = {
  showUserEditModal: createAction(`userEditModal/showUserEditModal`),
  closeUserEditModal: createAction(`userEditModal/closeUserEditModal`),
  disableSubmitButton: createAction(`userEditModal/disableSubmitButton`),
  enableSubmitButton: createAction(`userEditModal/enableSubmitButton`),
  handleChangeUser: createAction(`userEditModal/handleChangeUser`),
  inputClear: createAction(`userEditModal/inputClear`),
  changeUserInfo: createAction(`userEditModal/changeUserInfo`, (targetName: string, targetValue: string) => {
    return {
      payload: {
        targetName,
        targetValue,
      },
    };
  }),
  setUserInfo: createAction(`userEditModal/setUserInfo`, (userInfo: UserInfo) => {
    return {
      payload: {
        userInfo,
      },
    };
  }),
};

export const userEditModalActionsAsyncLogic = {
  updateUserInfo: createAction(`userEditModal/logic/updateUserInfo`),
  deleteUser: createAction(`userEditModal/logic/deleteUser`),
};
