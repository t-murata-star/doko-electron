import * as Actions from '../actions/userEdit';

export default function userEditModal(state = {
  onHide: false
}, action) {
  switch (action.type) {
    case Actions.SHOW_USER_EDIT_MODAL:
      return {
        ...state,
        onHide: true
      };
    case Actions.CLOSE_USER_EDIT_MODAL:
      return {
        ...state,
        onHide: false
      };
    default:
      return state;
  }
}
