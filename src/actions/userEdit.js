/**
 * Action type
 */
export const SHOW_USER_EDIT_MODAL = 'SHOW_USER_EDIT_MODAL';
export const CLOSE_USER_EDIT_MODAL = 'CLOSE_USER_EDIT_MODAL';

/**
 * Action Creator
 */
export const showModalActionCreator = (onHide) => ({
  type: SHOW_USER_EDIT_MODAL,
  onHide,
});

export const closeModalActionCreator = (onHide) => ({
  type: CLOSE_USER_EDIT_MODAL,
  onHide,
});
