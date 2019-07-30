import * as Actions from '../actions/userEditModal';

export default function userEditModal(state = {
  onHide: false,
  submitButtonStatus: true,
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
    case Actions.DISABLE_SUBMIT_BUTTON:
      return {
        ...state,
        submitButtonStatus: true,
      };
    case Actions.ENABLE_SUBMIT_BUTTON:
      return {
        ...state,
        userInfo: action.userInfo,
        submitButtonStatus: false,
      };
    default:
      return state;
  }
}
