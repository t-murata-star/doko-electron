/**
 * Action type
 */
export const SHOW_INITIAL_STARTUP_MODAL = 'SHOW_INITIAL_STARTUP_MODAL';
export const CLOSE_INITIAL_STARTUP_MODAL = 'CLOSE_INITIAL_STARTUP_MODAL';

/**
 * Action Creator
 */
export const showInitialStartupModalActionCreator = onHide => ({
  type: SHOW_INITIAL_STARTUP_MODAL,
  onHide
});

export const closeInitialStartupModalActionCreator = onHide => ({
  type: CLOSE_INITIAL_STARTUP_MODAL,
  onHide
});
