/**
 * Action type
 */
export const SHOW_INITIAL_STARTUP_MODAL = 'SHOW_INITIAL_STARTUP_MODAL';
export const CLOSE_INITIAL_STARTUP_MODAL = 'CLOSE_INITIAL_STARTUP_MODAL';
export const DISABLED_SUBMIT_BUTTON_INITIAL_STARTUP_MODAL = 'DISABLED_SUBMIT_BUTTON_INITIAL_STARTUP_MODAL';
export const IS_CHANGE_USER_INITIAL_STARTUP_MODAL = 'IS_CHANGE_USER_INITIAL_STARTUP_MODAL';

/**
 * Action Creator
 */
export const showInitialStartupModalActionCreator = () => ({
  type: SHOW_INITIAL_STARTUP_MODAL
});
export const closeInitialStartupModalActionCreator = () => ({
  type: CLOSE_INITIAL_STARTUP_MODAL
});
export const disableSubmitButtonActionCreator = (status: boolean) => ({
  type: DISABLED_SUBMIT_BUTTON_INITIAL_STARTUP_MODAL,
  status
});
export const isChengeUserActionCreator = (isChengeUser: boolean) => ({
  type: IS_CHANGE_USER_INITIAL_STARTUP_MODAL,
  isChengeUser
});
