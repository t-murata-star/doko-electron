import * as Actions from '../actions/initialStartupModal';

export default function initialStartupModal(
  state = {
    onHide: false
  },
  action
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
