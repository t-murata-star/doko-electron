import { createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';

export const userEditModalActions = {
  // ユーザ変更モーダルを表示
  showUserEditModal: createAction(`userEditModal/showUserEditModal`),
  // ユーザ変更モーダルを非表示
  closeUserEditModal: createAction(`userEditModal/closeUserEditModal`),
  // 登録ボタンを無効化
  disableSubmitButton: createAction(`userEditModal/disableSubmitButton`),
  // 登録ボタンを有効化
  enableSubmitButton: createAction(`userEditModal/enableSubmitButton`),
  // 登録ボタンを有効化
  inputClear: createAction(`userEditModal/inputClear`),
  // 画面の入力内容を state に設定する
  changeUserInfo: createAction(`userEditModal/changeUserInfo`, (targetName: string, targetValue: string) => {
    return {
      payload: {
        targetName,
        targetValue,
      },
    };
  }),
  // ユーザ情報を state に設定する
  setUserInfo: createAction(`userEditModal/setUserInfo`, (userInfo: UserInfo) => {
    return {
      payload: {
        userInfo,
      },
    };
  }),
};
