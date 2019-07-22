import * as Actions from '../actions/userEdit';

export default function userEdit(state = {
  onHide: false
}, action) {
  switch (action.type) {
    case Actions.SHOW_MODAL:
      return {
        ...state,
        onHide: true
      };
    case Actions.CLOSE_MODAL:
      return {
        ...state,
        onHide: false
      };
    default:
      return state;
  }
}
