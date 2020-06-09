import { createAction } from '@reduxjs/toolkit';

export const electronActionsAsyncLogic = {
  // アプリを実行しているPCがロックされた際の処理
  electronLockScreenEvent: createAction(`electron/logic/electronLockScreenEvent`),
  // アプリを実行しているPCのロックが解除された際の処理
  electronUnlockScreenEvent: createAction(`electron/logic/electronUnlockScreenEvent`),
  // アプリ終了時の処理
  closeApp: createAction(`electron/logic/closeApp`),
};
