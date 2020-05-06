import { createAction } from '@reduxjs/toolkit';

export const initialStartupModalActions = {
  showModal: createAction(`initialStartupModal/showModal`, (onHide: boolean) => {
    return {
      payload: {
        onHide,
      },
    };
  }),
  disableSubmitButton: createAction(`initialStartupModal/disableSubmitButton`, (disabled: boolean) => {
    return {
      payload: {
        disabled,
      },
    };
  }),
  changeSubmitMode: createAction(`initialStartupModal/changeSubmitMode`, (isChangeUser: boolean) => {
    return {
      payload: {
        isChangeUser,
      },
    };
  }),
  initializeState: createAction(`initialStartupModal/initializeState`),
  changeUserInfo: createAction(`initialStartupModal/changeUserInfo`, (targetName: string, targetValue: string) => {
    return {
      payload: {
        targetName,
        targetValue,
      },
    };
  }),
  changeUserId: createAction(`initialStartupModal/changeUserId`, (selectedUserId: number) => {
    return {
      payload: {
        selectedUserId,
      },
    };
  }),
  initializeField: createAction(`initialStartupModal/initializeField`),
};

export const initialStartupModalActionsAsyncLogic = {
  addUser: createAction(`initialStartupModal/logic/addUser`),
  changeUser: createAction(`initialStartupModal/logic/changeUser`),
  selectFromExistingUsers: createAction(`initialStartupModal/logic/selectFromExistingUsers`),
};
