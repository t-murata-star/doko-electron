import { UserInfo } from '../define/model';

/**
 * Action type
 */
export const SHOW_USER_EDIT_MODAL = 'SHOW_USER_EDIT_MODAL';
export const CLOSE_USER_EDIT_MODAL = 'CLOSE_USER_EDIT_MODAL';
export const DISABLE_SUBMIT_BUTTON = 'DISABLE_SUBMIT_BUTTON';
export const ENABLE_SUBMIT_BUTTON = 'ENABLE_SUBMIT_BUTTON';
export const HANDLE_CHANGE_USER = 'HANDLE_CHANGE_USER';
export const HANDLE_EDIT_USER = 'HANDLE_EDIT_USER';
export const INPUT_CLEAR = 'INPUT_CLEAR';
export const CHANGE_USER_INFO = 'CHANGE_USER_INFO';

/**
 * Action Creator
 */
export const showUserEditModalActionCreator = (userID: number, userInfo: UserInfo) => ({
  type: SHOW_USER_EDIT_MODAL,
  userID,
  userInfo
});

export const closeUserEditModalActionCreator = () => ({
  type: CLOSE_USER_EDIT_MODAL
});

export const disableSubmitButtonActionCreator = () => ({
  type: DISABLE_SUBMIT_BUTTON
});

export const enableSubmitButtonActionCreator = () => ({
  type: ENABLE_SUBMIT_BUTTON
});

export const handleChangeUserActionCreator = () => ({
  type: HANDLE_CHANGE_USER
});

export const handleEditUserActionCreator = () => ({
  type: HANDLE_EDIT_USER
});

export const inputClearActionCreator = (userInfo: UserInfo) => ({
  type: INPUT_CLEAR,
  userInfo
});

export const changeUserInfoActionCreator = (userInfo: UserInfo, key: string, value: string) => ({
  type: CHANGE_USER_INFO,
  userInfo,
  key,
  value
});
