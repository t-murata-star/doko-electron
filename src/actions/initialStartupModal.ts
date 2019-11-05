/**
 * Action type
 */
export const SHOW_INITIAL_STARTUP_MODAL = 'SHOW_INITIAL_STARTUP_MODAL';
export const CLOSE_INITIAL_STARTUP_MODAL = 'CLOSE_INITIAL_STARTUP_MODAL';

/**
 * Action Creator
 */
export const showInitialStartupModalActionCreator = () => ({
  type: SHOW_INITIAL_STARTUP_MODAL
});

export const closeInitialStartupModalActionCreator = () => ({
  type: CLOSE_INITIAL_STARTUP_MODAL
});
