import React from 'react';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import './App.scss';
import UserList from '../containers/UserListPanel';
import OfficeInfo from '../containers/OfficeInfoPanel';
import Settings from '../containers/SettingsPanel';
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
  returnEmptyUserListActionCreator,
  setUpdatedAtActionCreator,
  setMyUserIDActionCreator
} from '../actions/userList';
import { getRestroomUsageAction } from '../actions/officeInfo';
import { AUTH_REQUEST_HEADERS, HEARTBEAT_INTERVAL_MS, APP_DOWNLOAD_URL } from '../define';
import { UserInfo, Notification } from '../define/model';
import { getUserInfo, sendHeartbeat } from './common/functions';

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

    /**
     * スタートアップ登録処理。
     * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
     */
    if (!electronStore.get('startup.notified')) {
      const index = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        title: '行き先掲示板',
        type: 'info',
        buttons: ['YES', 'NO'],
        message: 'スタートアップを有効にしますか？\n※PCを起動した際に自動的に行き先掲示板が起動します。'
      });

      let openAtLogin;

      switch (index) {
        // ダイアログで「OK」を選択した場合
        case 0:
          openAtLogin = true;
          break;

        // ダイアログで「OK」以外を選択した場合
        default:
          openAtLogin = false;
          break;
      }

      electronStore.set('startup.notified', 1);

      remote.app.setLoginItemSettings({
        openAtLogin,
        path: remote.app.getPath('exe')
      });
    }
    // TODO: notified_startup は廃止予定のため、次回アプリケーションのアップデートの際に該当処理を削除する
    electronStore.delete('notified_startup');

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
        remote.shell.openExternal(APP_DOWNLOAD_URL);
      }
    } catch (error) {
      this._showMessageBox(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL);
    }

    /**
     * お知らせチェック
     */
    if (notification.enabled) {
      this._showMessageBox(notification.content);
    }

    /**
     * アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
     */
    setInterval(() => {
      sendHeartbeat(dispatch);
    }, HEARTBEAT_INTERVAL_MS);

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (userID === -1) {
      this._showModal();
      return;
    }

    await dispatch(getUserListAction());
    if (store.getState().userListState.isError.status === true) {
      return;
    }

    const userList: UserInfo[] = store.getState().userListState['userList'];
    const userInfo = getUserInfo(userList, userID);

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
      userInfo['status'] = '在席';
      updatedUserInfo['status'] = userInfo['status'];
      updatedUserInfo['name'] = userInfo['name'];
    }

    await dispatch(updateUserInfoAction(updatedUserInfo, userID));

    // 情報更新(updateUserInfoAction)の結果を元に、更新日時を更新する
    userInfo['updatedAt'] = store.getState().userListState.updatedAt;
    dispatch(setUpdatedAtActionCreator(JSON.parse(JSON.stringify(userList))));

    sendHeartbeat(dispatch);
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  };

  electronLockScreenEvent = ipcRenderer.on('electronLockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = store.getState().userListState['myUserID'];
    const userList = store.getState().userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['name'] = userInfo['name'];
    updatedUserInfo['status'] = '在席 (離席中)';
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, myUserID));
  });

  electronUnlockScreenEvent = ipcRenderer.on('electronUnlockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = store.getState().userListState['myUserID'];
    const userList = store.getState().userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['name'] = userInfo['name'];
    updatedUserInfo['status'] = '在席';
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, myUserID));

    sendHeartbeat(dispatch);
  });

  closeApp = ipcRenderer.on('closeApp', async (event: any) => {
    const { dispatch } = this.props;

    const myUserID = store.getState().userListState['myUserID'];
    const userList = store.getState().userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
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
    const myUserID = store.getState().userListState['myUserID'];

    return (
      <div>
        <Loading state={store.getState()} />
        {myUserID !== -1 && (
          <div>
            <TabBar
              className='tab header'
              activeIndex={this.state.activeIndex}
              handleActiveIndexUpdate={this.handleActiveIndexUpdate}>
              <Tab className='tab'>
                <span className='mdc-tab__text-label'>社員情報</span>
              </Tab>
              <Tab className='tab'>
                <span className='mdc-tab__text-label'>社内情報</span>
              </Tab>
              <Tab className='tab'>
                <span className='mdc-tab__text-label'>設定</span>
              </Tab>
            </TabBar>
          </div>
        )}
        <div className='contents'>
          {myUserID !== -1 && this.state.activeIndex === 0 && (
            <div>
              <UserList />
              <MenuButtonGroupForUserList />
            </div>
          )}
          {myUserID !== -1 && this.state.activeIndex === 1 && (
            <div>
              <OfficeInfo />
              <MenuButtonGroupForOfficeInfo />
            </div>
          )}
          {myUserID !== -1 && this.state.activeIndex === 2 && (
            <div>
              <Settings />
            </div>
          )}
        </div>
        <InitialStartupModal />
      </div>
    );
  }
}

export default App;
