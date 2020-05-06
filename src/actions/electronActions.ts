import { createAction } from '@reduxjs/toolkit';

export const electronActionsAsyncLogic = {
  electronLockScreenEvent: createAction(`electron/logic/electronLockScreenEvent`),
  electronUnlockScreenEvent: createAction(`electron/logic/electronUnlockScreenEvent`),
  closeApp: createAction(`electron/logic/closeApp`),
};
