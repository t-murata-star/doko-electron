import React from 'react';
import './App.scss';
import UserList from '../containers/UserListPanel';
import OfficeInfo from '../containers/OfficeInfoPanel';
import MenuButtonGroupForUserList from '../containers/MenuButtonGroupPanelForUserList';
import MenuButtonGroupForOfficeInfo from '../containers/MenuButtonGroupPanelForOfficeInfo';
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading';
import store from '../store/configureStore';
import {
  loginAction,
  getUserListAction,
  updateUserInfoAction,
  getNotificationAction,
  sendHeartbeatAction,
  returnEmptyUserListActionCreator,
  setUpdatedAtActionCreator,
  setMyUserIDActionCreator
} from '../actions/userList';
import { getRestroomUsageAction } from '../actions/officeInfo';
import { AUTH_REQUEST_HEADERS, HEARTBEAT_INTERVAL_MS, APP_DOWNLOAD_URL } from '../define';
import { UserInfo, Notification } from '../define/model';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { activeIndex: 0 };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const userID: number = (electronStore.get('userID') as number | undefined) || -1;

    // state ユーザIDを設定
    await dispatch(setMyUserIDActionCreator(userID));

    // WEBアプリケーション接続確認用のため、Cookieにパラメータを設定する
    document.cookie = 'isConnected=true';

    await dispatch(loginAction());

    if (store.getState().userListState.isError.code === 401) {
      this._showMessageBox('認証に失敗しました。');
      return;
    }

    // APIリクエストヘッダに認証トークンを設定する
    AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + store.getState().userListState.token;

    if (store.getState().userListState.isError.status) {
      return;
    }

    // お知らせチェック
    await dispatch(getNotificationAction());

    const notification: Notification = store.getState().userListState.notification;
    const updateNotificationMessage: string = `新しい行き先掲示板が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`;

    /**
     * バージョンチェック
     * 実行しているアプリケーションのバージョンが最新ではない場合、自動的に規定のブラウザでダウンロード先URLを開く
     */
    try {
      const session = remote.session.defaultSession as Electron.Session;
      const cookies: any = await session.cookies.get({
        name: 'version'
      });
      if (notification.latestAppVersion !== cookies[0].value) {
        this._showMessageBox(updateNotificationMessage);
        remote.shell.openExternal(APP_DOWNLOAD_URL || '');
      }
    } catch (error) {
      this._showMessageBox(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL || '');
    }

    /**
     * お知らせチェック
     */
    if (notification.targetIDs.includes(userID) && notification.content !== '') {
      this._showMessageBox(notification.content);
    }

    /**
     * アプリケーションの死活監視ため、定期的にサーバにリクエストを送信する
     */
    setInterval(this._heartbeat, HEARTBEAT_INTERVAL_MS);

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (!userID) {
      this._showModal();
      return;
    }

    await dispatch(getUserListAction());
    if (store.getState().userListState.isError.status === true) {
      return;
    }

    const userList: UserInfo[] = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    if (userInfo === null) {
      dispatch(returnEmptyUserListActionCreator());
      this._showMessageBox('ユーザ情報が存在しないため、ユーザ登録を行います。');
      dispatch(showInitialStartupModalActionCreator());
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = userID;

    const session = remote.session.defaultSession as Electron.Session;
    const cookies: any = await session.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      updatedUserInfo['version'] = cookies[0].value;
    }

    // 状態が「退社」のユーザのみ、状態を「在席」に変更する
    if (userInfo['status'] === '退社') {
      updatedUserInfo['status'] = '在席';
      updatedUserInfo['name'] = userInfo['name'];
    }

    Object.assign(userInfo, updatedUserInfo);

    await dispatch(updateUserInfoAction(updatedUserInfo, userID));

    // 情報更新(updateUserInfoAction)の結果を元に、更新日時を更新する
    userInfo['updated_at'] = store.getState().userListState.updatedAt;
    dispatch(setUpdatedAtActionCreator(Object.assign([], userList)));

    this._heartbeat();
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  };

  _getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
    if (!userList) {
      return null;
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || null;
  };

  _heartbeat = () => {
    const { dispatch } = this.props;

    const myUserID = store.getState().userListState['myUserId'];
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['heartbeat'] = '';
    dispatch(sendHeartbeatAction(updatedUserInfo, myUserID));
  };

  updateInfo = ipcRenderer.on('updateInfo', (event: any, key: string | number, value: any) => {
    const { dispatch } = this.props;

    const myUserID = store.getState().userListState['myUserId'];
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, myUserID);
    if (userInfo === null || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['name'] = userInfo['name'];
    updatedUserInfo[key] = value;
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, myUserID));
  });

  appClose = ipcRenderer.on('appClose', async (event: any) => {
    const { dispatch } = this.props;

    const myUserID = store.getState().userListState['myUserId'];
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, myUserID);
    if (userInfo === null || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      ipcRenderer.send('close');
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['status'] = '退社';
    updatedUserInfo['name'] = userInfo['name'];
    Object.assign(userInfo, updatedUserInfo);
    await dispatch(updateUserInfoAction(updatedUserInfo, myUserID));
    ipcRenderer.send('close');
  });

  _showMessageBox = (message: any) => {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK'],
      message
    });
  };

  handleActiveIndexUpdate = async (activeIndex: any) => {
    const { dispatch } = this.props;
    this.setState({ activeIndex });

    // 同じタブを複数押下した場合
    if (this.state.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        await dispatch(getUserListAction());
        break;

      // 社員情報タブを選択
      case 1:
        await dispatch(getRestroomUsageAction());
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <div>
        <Loading state={store.getState()} />
        <TabBar className='tab' activeIndex={this.state.activeIndex} handleActiveIndexUpdate={this.handleActiveIndexUpdate}>
          <Tab className='tab'>
            <span className='mdc-tab__text-label'>社員情報</span>
          </Tab>
          <Tab className='tab'>
            <span className='mdc-tab__text-label'>社内情報</span>
          </Tab>
        </TabBar>
        {this.state.activeIndex === 0 && (
          <div>
            <UserList />
            <MenuButtonGroupForUserList />
          </div>
        )}
        {this.state.activeIndex === 1 && (
          <div>
            <OfficeInfo />
            <MenuButtonGroupForOfficeInfo />
          </div>
        )}
        <InitialStartupModal />
      </div>
    );
  }
}

export default App;
