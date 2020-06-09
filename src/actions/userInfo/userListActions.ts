import { createAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../define/model';

export const userListActions = {
  // ユーザ一覧取得成功
  getUserListSuccess: createAction(`userList/getUserListSuccess`, (userList: UserInfo[]) => {
    return {
      payload: {
        userList,
      },
    };
  }),
  // ユーザ情報更新成功
  updateUserInfoSuccess: createAction(`userList/updateUserInfoSuccess`),
  // ヘルスチェック送信成功
  sendHealthCheckSuccess: createAction(`userList/sendHealthCheckSuccess`),
  // ユーザ情報における、バージョン情報の更新成功
  updateAppVersionSuccess: createAction(`userList/updateAppVersionSuccess`),
  // ユーザ情報における、ユーザ一覧表示順序の更新成功
  changeOrderSuccess: createAction(`userList/changeOrderSuccess`),
  // ユーザ追加成功
  addUserSuccess: createAction(`userList/addUserSuccess`),
  // ユーザ削除成功
  deleteUserSuccess: createAction(`userList/deleteUserSuccess`),
  // ユーザ一覧で選択したユーザのIDを設定
  selectUser: createAction(`userList/selectUser`, (selectedUserId: number) => {
    return {
      payload: {
        selectedUserId,
      },
    };
  }),
  // 画面操作不可の状態
  inoperable: createAction(`userList/inoperable`, (inoperable: boolean) => {
    return {
      payload: {
        inoperable,
      },
    };
  }),
  // ユーザ一覧画面の再描画
  reRenderUserList: createAction(`userList/reRenderUserList`),
  // ユーザ情報の state を更新
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
  // ユーザ情報更新処理
  updateUserInfo: createAction(`userList/logic/updateUserInfo`),
  // ユーザ削除処理
  deleteUser: createAction(`userList/logic/deleteUser`),
  // ユーザ一覧表示順序更新処理
  updateUserInfoOrder: createAction(`userList/logic/updateUserInfoOrder`, (rowComponent: Tabulator.RowComponent) => {
    return {
      payload: {
        rowComponent,
      },
    };
  }),
  // ユーザ一覧再取得処理
  reload: createAction(`userList/logic/reload`),
};
