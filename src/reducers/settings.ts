import * as SettingsActions from '../actions/settings';

export class _SettingsState {
  system = {
    openAtLogin: false,
    email: ''
  };
}

/**
 * 設定情報のstateを管理するReducer
 */
export default function settingState(
  state = new _SettingsState(),
  action: any
) {
  switch (action.type) {
    case SettingsActions.CLOSE_INITIAL_STARTUP_MODAL:
      return {
        ...state,
        email: {
          ...state.system,
        },
      };

    default:
      return state;
  }
}
