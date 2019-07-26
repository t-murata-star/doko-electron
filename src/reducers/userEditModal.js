import * as Actions from '../actions/userEditModal';

export default function userEditModal(state = {
  onHide: false,
  userID: null,
  userInfo: {}
}, action) {
  switch (action.type) {
    case Actions.SHOW_USER_EDIT_MODAL:
      return {
        ...state,
        onHide: true,
        userID: action.userID,
        userInfo: action.userInfo
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
