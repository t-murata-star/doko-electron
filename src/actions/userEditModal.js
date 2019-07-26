/**
 * Action type
 */
export const SHOW_USER_EDIT_MODAL = 'SHOW_USER_EDIT_MODAL';
export const CLOSE_USER_EDIT_MODAL = 'CLOSE_USER_EDIT_MODAL';

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
