import { createAction } from '@reduxjs/toolkit';

export const settingActions = {
  // state を初期化
  initializeState: createAction(`settings/initializeState`),
  // ユーザIDを設定
  setUserId: createAction(`settings/setUserId`, (userId: number) => {
    return {
      payload: {
        userId,
      },
    };
  }),
  // メールアドレスを設定
  setEmail: createAction(`settings/setEmail`, (email: string) => {
    return {
      payload: {
        email,
      },
    };
  }),
  // ユーザ変更ボタンの状態変更
  changeDisabledSubmitButtonUserChange: createAction(`settings/changeDisabledSubmitButtonUserChange`, (disable: boolean) => {
    return {
      payload: {
        disable,
      },
    };
  }),
  // メールアドレス変更ボタンの状態変更
  changeDisabledSubmitButtonEmail: createAction(`settings/changeDisabledSubmitButtonEmail`, (disable: boolean) => {
    return {
      payload: {
        disable,
      },
    };
  }),
  // スタートアップ有効/無効切り替えスイッチ状態変更
  changeEnabledStartup: createAction(`settings/changeEnabledStartup`, (startupEnabled: boolean) => {
    return {
      payload: {
        startupEnabled,
      },
    };
  }),
};

export const settingActionsAsyncLogic = {
  // メールアドレス保存処理
  saveSettingsForEmail: createAction(`settings/logic/saveSettingsForEmail`),
};
