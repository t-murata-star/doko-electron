import * as Actions from '../actions/initialStartupModal';

export class _initialStartupModal {
  onHide: boolean = false;
  submitButtonDisabled: boolean = true;
  isChangeUser: boolean = false;
}

export default function initialStartupModal(state = new _initialStartupModal(), action: any) {
  switch (action.type) {
    case Actions.SHOW_INITIAL_STARTUP_MODAL:
      return {
        ...state,
        onHide: true
      };
    case Actions.CLOSE_INITIAL_STARTUP_MODAL:
      return {
        ...state,
        onHide: false
      };
    case Actions.DISABLED_SUBMIT_BUTTON_INITIAL_STARTUP_MODAL:
      return {
        ...state,
        submitButtonDisabled: action.status
      };
    case Actions.IS_CHANGE_USER_INITIAL_STARTUP_MODAL:
      return {
        ...state,
        isChangeUser: action.isChengeUser
      };
    default:
      return state;
  }
}
