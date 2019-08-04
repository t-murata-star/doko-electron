import * as Actions from '../actions/userEditModal';
import { USER_INFO } from '../define';

export default function userEditModal(state = {
  onHide: false,
  submitButtonStatus: true,
  isChangeUser: false,
  userID: null,
  userInfo: USER_INFO
}, action) {
  switch (action.type) {
    case Actions.SHOW_USER_EDIT_MODAL:
      return {
        ...state,
        onHide: true,
        isChangeUser: false,
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
        submitButtonStatus: false,
      };
    case Actions.HANDLE_CHANGE_USER:
      return {
        ...state,
        submitButtonStatus: true,
        isChangeUser: true,
      };
    case Actions.HANDLE_EDIT_USER:
      return {
        ...state,
        submitButtonStatus: true,
        isChangeUser: false,
      };
    case Actions.INPUT_CLEAR:
      action.userInfo['status'] = '在席';
      action.userInfo['destination'] = '';
      action.userInfo['return'] = '';
      return {
        ...state,
        userInfo: action.userInfo
      };
    case Actions.CHANGE_USER_INFO:
      action.userInfo[action.key] = action.value;
      return {
        ...state,
        userInfo: action.userInfo
      };

    default:
      return state;
  }
}
