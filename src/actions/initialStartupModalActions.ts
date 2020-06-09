import { createAction } from '@reduxjs/toolkit';

export const initialStartupModalActions = {
  // ユーザ登録モーダルの表示/非表示を設定
  showModal: createAction(`initialStartupModal/showModal`, (onHide: boolean) => {
    return {
      payload: {
        onHide,
      },
    };
  }),
  // ユーザ登録ボタンの状態変更
  disableSubmitButton: createAction(`initialStartupModal/disableSubmitButton`, (disabled: boolean) => {
    return {
      payload: {
        disabled,
      },
    };
  }),
  // 新規ユーザ登録か、既存ユーザから選択して登録かどうかの設定
  changeSubmitMode: createAction(`initialStartupModal/changeSubmitMode`, (isChangeUser: boolean) => {
    return {
      payload: {
        isChangeUser,
      },
    };
  }),
  // state を初期化
  initializeState: createAction(`initialStartupModal/initializeState`),
  // 画面の入力内容を state に設定する
  changeUserInfo: createAction(`initialStartupModal/changeUserInfo`, (targetName: string, targetValue: string) => {
    return {
      payload: {
        targetName,
        targetValue,
      },
    };
  }),
  // 既存ユーザを選択した際のユーザIDを設定する
  changeUserId: createAction(`initialStartupModal/changeUserId`, (selectedUserId: number) => {
    return {
      payload: {
        selectedUserId,
      },
    };
  }),
  // テキストボックスの入力内容を初期化する
  initializeField: createAction(`initialStartupModal/initializeField`),
};

export const initialStartupModalActionsAsyncLogic = {
  // 新規ユーザ登録処理
  addUser: createAction(`initialStartupModal/logic/addUser`),
  // 既存ユーザを選択して登録する処理
  changeUser: createAction(`initialStartupModal/logic/changeUser`),
  // 既存ユーザを選択画面表示処理
  selectFromExistingUsers: createAction(`initialStartupModal/logic/selectFromExistingUsers`),
};
