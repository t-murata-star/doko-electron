/**
 * Action type
 */
export const SET_USER_ID = 'SET_USER_ID';
export const SET_EMAIL = 'SET_EMAIL';
export const CHANGE_DISABLED_SUBMIT_BUTTON_USER_CHANGE = 'CHANGE_DISABLED_SUBMIT_BUTTON_USER_CHANGE';
export const CHANGE_ENABLED_STARTUP = 'CHANGE_ENABLED_STARTUP';
export const CHANGE_ENABLED_SNACKBAR = 'CHANGE_ENABLED_SNACKBAR';

/**
 * Action Creator
 */
export const setUserIDActionCreator = (userID: number) => ({
  type: SET_USER_ID,
  userID
});
export const setEmailActionCreator = (email: string) => ({
  type: SET_EMAIL,
  email
});
export const changeDisabledSubmitButtonUserChangeActionCreator = (disabled: boolean) => ({
  type: CHANGE_DISABLED_SUBMIT_BUTTON_USER_CHANGE,
  disabled
});
export const changeEnabledStartupActionCreator = (enabled: boolean) => ({
  type: CHANGE_ENABLED_STARTUP,
  enabled
});
export const changeEnabledSnackbarActionCreator = (enabled: boolean, message: string = '', timeoutMs: number = 5000) => ({
  type: CHANGE_ENABLED_SNACKBAR,
  enabled,
  message,
  timeoutMs
});
