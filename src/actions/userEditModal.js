/**
 * Action type
 */
export const SHOW_USER_EDIT_MODAL = 'SHOW_USER_EDIT_MODAL';
export const CLOSE_USER_EDIT_MODAL = 'CLOSE_USER_EDIT_MODAL';
export const DISABLE_SUBMIT_BUTTON = 'DISABLE_SUBMIT_BUTTON';
export const ENABLE_SUBMIT_BUTTON = 'ENABLE_SUBMIT_BUTTON';

/**
 * Action Creator
 */
export const showUserEditModalActionCreator = (userID, userInfo) => ({
  type: SHOW_USER_EDIT_MODAL,
  userID,
  userInfo,
});

export const closeUserEditModalActionCreator = () => ({
  type: CLOSE_USER_EDIT_MODAL,
});

export const disableSubmitButtonActionCreator = () => ({
  type: DISABLE_SUBMIT_BUTTON,
});

export const enableSubmitButtonActionCreator = (userInfo) => ({
  type: ENABLE_SUBMIT_BUTTON,
  userInfo,
});
