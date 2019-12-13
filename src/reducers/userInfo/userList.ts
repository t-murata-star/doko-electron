import * as UserListActions from '../../actions/userInfo/userList';
import { LEAVING_TIME_THRESHOLD_M } from '../../define';
import { UserInfo, RequestError, Notification } from '../../define/model';

export class _UserListState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  userList: UserInfo[] = [];
  changeUserList: UserInfo[] = []; // サーバ上に登録されているユーザの中から自分のユーザを選択するために格納するユーザ一覧（userListと同じデータ）
  updatedAt: string = '';
  isFetching: boolean = false;
  isError: RequestError = new RequestError();
  myUserID: number = -1;
  selectedUserId: number = -1; // ユーザ一覧画面で編集中のユーザのIDを格納する
  notification: Notification = new Notification();
  updateInstallerUrl: string = '';
}

function userListIsFetching(state = false, action: any) {
  switch (action.type) {
    case UserListActions.LOGIN:
      return true;
    case UserListActions.GET_USER_LIST:
      return true;
    case UserListActions.UPDATE_USER_INFO:
      return true;
    case UserListActions.ADD_USER:
      return true;
    case UserListActions.DELETE_USER:
      return true;
    case UserListActions.CHECK_NOTIFICATION:
      return true;
    case UserListActions.GET_S3_SIGNED_URL:
      return true;
    default:
      return false;
  }
}

function userListIsError(state = new RequestError(), action: any) {
  switch (action.type) {
    case UserListActions.REQUEST_ERROR:
      return {
        ...state,
        status: true,
        code: action.payload.statusCode,
        text: action.payload.statusText
      };
    case UserListActions.FAIL_REQUEST:
      return {
        ...state,
        status: true,
        code: null,
        text: action.payload.message
      };
    default:
      return {
        ...state,
        status: false,
        code: null,
        text: ''
      };
  }
}

/**
 * 登録者情報一覧のstateを管理するReducer
 */
export default function userListState(state = new _UserListState(), action: any) {
  switch (action.type) {
    case UserListActions.LOGIN:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.response.token,
        isAuthenticated: true,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.REQUEST_ERROR:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.GET_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.GET_USER_LIST_SUCCESS:
      return {
        ...state,
        userList: updateLeavingTimeForUserList(action.payload.response, state.myUserID),
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.FAIL_REQUEST:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.UPDATE_USER_INFO:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.UPDATE_USER_INFO_SUCCESS:
      return {
        ...state,
        updatedAt: action.payload.response.updatedAt,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.CHANGE_ORDER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.CHANGE_ORDER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.UPDATE_STATE_USERLIST:
      return {
        ...state,
        userList: action.userList
      };
    case UserListActions.ADD_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.ADD_USER_SUCCESS:
      return {
        ...state,
        myUserID: action.userID,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.DELETE_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.DELETE_USER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.SELECT_USER:
      return {
        ...state,
        selectedUserId: action.selectedUserId
      };
    case UserListActions.RETURN_EMPTY_USER_LIST:
      return {
        ...state,
        userList: action.userList
      };
    case UserListActions.RETURN_EMPTY_CHANGE_USER_LIST:
      return {
        ...state,
        changeUserList: action.changeUserList
      };
    case UserListActions.UNAUTHORIZED:
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    case UserListActions.CHECK_NOTIFICATION_SUCCESS:
      return {
        ...state,
        notification: action.notification
      };
    case UserListActions.SEND_HEARTBEAT:
      return {
        ...state
      };
    case UserListActions.SET_MY_USER_ID:
      return {
        ...state,
        myUserID: action.userID
      };
    case UserListActions.GET_S3_SIGNED_URL_SUCCESS:
      return {
        ...state,
        updateInstallerUrl: action.updateInstallerUrl
      };
    default:
      return state;
  }
}

/**
 * 全ユーザの退社チェック
 * LEAVING_TIME_THRESHOLD_M 以上heartbeatが更新されていないユーザの状態を「退社」に変更する。
 * ただし、この変更は画面表示のみであり、サーバ上の情報は更新しない。
 */
function updateLeavingTimeForUserList(userList: UserInfo[], myUserID: number) {
  if (!userList) return [];

  const nowDate: Date = new Date();
  userList.forEach(userInfo => {
    if (userInfo.id === myUserID) {
      return;
    }
    if (['在席', '在席 (離席中)'].includes(userInfo['status']) === true) {
      const heartbeat: Date = new Date(userInfo['heartbeat']);
      const diffMin = Math.floor((nowDate.getTime() - heartbeat.getTime()) / (1000 * 60));
      if (diffMin >= LEAVING_TIME_THRESHOLD_M) {
        userInfo['status'] = '退社';
        // 更新日時を最後のheartbeat送信日時に設定する
        userInfo['updatedAt'] = userInfo['heartbeat'];
      }
    }
  });

  return userList;
}
