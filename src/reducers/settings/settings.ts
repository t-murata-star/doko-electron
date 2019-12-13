import * as SettingsActions from '../../actions/settings/settings';

export class _SettingsState {
  submitButtonsDisable = {
    user: {
      userChange: true,
      email: true
    }
  };
  snackbar = {
    enabled: false,
    message: '',
    timeoutMs: 5000
  };
  user = {
    userID: -1,
    email: ''
  };
  system = {
    startupEnabled: false
  };
}

/**
 * 設定情報のstateを管理するReducer
 */
export default function settingState(state = new _SettingsState(), action: any) {
  switch (action.type) {
    case SettingsActions.SET_USER_ID:
      return {
        ...state,
        user: {
          ...state.user,
          userID: action.userID
        }
      };
    case SettingsActions.SET_EMAIL:
      return {
        ...state,
        user: {
          ...state.user,
          email: action.email
        }
      };
    case SettingsActions.CHANGE_DISABLED_SUBMIT_BUTTON_USER_CHANGE:
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            userChange: action.disabled
          }
        }
      };
    case SettingsActions.CHANGE_DISABLED_SUBMIT_BUTTON_EMAIL:
      return {
        ...state,
        submitButtonsDisable: {
          ...state.submitButtonsDisable,
          user: {
            ...state.submitButtonsDisable.user,
            email: action.disabled
          }
        }
      };
    case SettingsActions.CHANGE_ENABLED_STARTUP:
      return {
        ...state,
        system: {
          ...state.system,
          startupEnabled: action.enabled
        }
      };
    case SettingsActions.CHANGE_ENABLED_SNACKBAR:
      return {
        ...state,
        snackbar: {
          ...state.snackbar,
          enabled: action.enabled,
          message: action.message,
          timeoutMs: action.timeoutMs
        }
      };
    case SettingsActions.INITIALIZE_SETTING_STATE:
      return new _SettingsState();

    default:
      return state;
  }
}
