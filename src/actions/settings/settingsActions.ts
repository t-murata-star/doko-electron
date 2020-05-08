import { createAction } from '@reduxjs/toolkit';

export const settingActions = {
  initializeState: createAction(`settings/initializeState`),
  setUserId: createAction(`settings/setUserId`, (userID: number) => {
    return {
      payload: {
        userID,
      },
    };
  }),
  setEmail: createAction(`settings/setEmail`, (email: string) => {
    return {
      payload: {
        email,
      },
    };
  }),
  changeDisabledSubmitButtonUserChange: createAction(`settings/changeDisabledSubmitButtonUserChange`, (disable: boolean) => {
    return {
      payload: {
        disable,
      },
    };
  }),
  changeDisabledSubmitButtonEmail: createAction(`settings/changeDisabledSubmitButtonEmail`, (disable: boolean) => {
    return {
      payload: {
        disable,
      },
    };
  }),
  changeEnabledStartup: createAction(`settings/changeEnabledStartup`, (startupEnabled: boolean) => {
    return {
      payload: {
        startupEnabled,
      },
    };
  }),
};

export const settingActionsAsyncLogic = {
  saveSettingsForEmail: createAction(`settings/logic/saveSettingsForEmail`),
};
