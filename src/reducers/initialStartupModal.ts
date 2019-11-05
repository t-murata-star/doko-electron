import * as Actions from '../actions/initialStartupModal';

export class _initialStartupModal {
  onHide: boolean = false
}

export default function initialStartupModal(
  state = new _initialStartupModal(),
  action: any
) {
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
    default:
      return state;
  }
}
