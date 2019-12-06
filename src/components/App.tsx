import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import { getRestroomUsageAction } from '../actions/officeInfo';
import {
  getNotificationAction,
  getUserListAction,
  loginAction,
  returnEmptyUserListActionCreator,
  setMyUserIDActionCreator,
  updateStateUserListActionCreator,
  updateUserInfoAction
} from '../actions/userList';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import MenuButtonGroupForOfficeInfo from '../containers/MenuButtonGroupPanelForOfficeInfo';
import MenuButtonGroupForUserList from '../containers/MenuButtonGroupPanelForUserList';
import OfficeInfo from '../containers/OfficeInfoPanel';
import Settings from '../containers/SettingsPanel';
import UserList from '../containers/UserListPanel';
import {
  APP_DOWNLOAD_URL,
  APP_NAME,
  APP_VERSION,
  AUTH_REQUEST_HEADERS,
  HEARTBEAT_INTERVAL_MS,
  UPDATE_INSTALLER_FILENAME
} from '../define';
import { Notification, UserInfo } from '../define/model';
import store from '../store/configureStore';
import './App.scss';
import { getUserInfo, sendHeartbeat } from './common/functions';
import Loading from './Loading';
import { tabTheme } from './materialui/theme';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();
const execFileSync = window.require('child_process').execFileSync;

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { activeIndex: 0 };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const userID: number = (electronStore.get('userID') as number | undefined) || -1;

    // メインプロセスに、WEBアプリケーションに接続できたことを伝える
    ipcRenderer.send('connected', true);

    await dispatch(loginAction());

    if (store.getState().userListState.isError.status) {
      ipcRenderer.send('connected', false);
      remote.getCurrentWindow().loadFile(remote.getGlobal('ERROR_PAGE_FILEPATH'));
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
    const updateNotificationMessage: string = `新しい${APP_NAME}が公開されました。\nVersion ${notification.latestAppVersion}\nアップデートを開始します。`;

    /**
     * バージョンチェック
     * 実行しているアプリケーションのバージョンが最新ではない場合、
     * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
     */
    // if (notification.latestAppVersion !== APP_VERSION) {
    if (1) {
      const index = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        title: APP_NAME,
        type: 'info',
        buttons: ['開始', '終了'],
        message: updateNotificationMessage
      });

      switch (index) {
        case 0:
          // TODO:既にダウンロード済みの場合、そのインストーラを起動する。
          switch (remote.process.platform) {
            case 'win32':
              ipcRenderer.send('updateApp', `${UPDATE_INSTALLER_FILENAME}.exe`, notification.updateInstallerURLs.windows);
              break;

            case 'darwin':
              ipcRenderer.send('updateApp', `${UPDATE_INSTALLER_FILENAME}.dmg`, notification.updateInstallerURLs.mac);
              break;

            default:
              break;
          }
          // remote.shell.openExternal(APP_DOWNLOAD_URL);
          // remote.getCurrentWindow().destroy();
          break;

        default:
          remote.getCurrentWindow().destroy();
          break;
      }

      return;
    }

    /**
     * スタートアップ登録処理。
     * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
     */
    if (!electronStore.get('startup.notified') && !electronStore.get('notified_startup')) {
      const index = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        title: APP_NAME,
        type: 'info',
        buttons: ['YES', 'NO'],
        message: `スタートアップを有効にしますか？\n※PCを起動した際に自動的に${APP_NAME}が起動します。
        `
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
    } else {
      electronStore.set('startup.notified', 1);
    }
    // TODO: notified_startup は廃止予定のため、次回アプリケーションのアップデートの際に該当処理を削除する
    electronStore.delete('notified_startup');

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

    dispatch(setMyUserIDActionCreator(userID));
    dispatch(updateStateUserListActionCreator(userList));
    dispatch(updateUserInfoAction(updatedUserInfo, userID));

    sendHeartbeat(dispatch);
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  };

  electronMinimizeEvent = ipcRenderer.on('electronMinimizeEvent', () => {
    remote.getCurrentWindow().hide();
  });

  // 状態を「離席中」に更新する
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

  // 状態を「在席」に更新する
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

  updateOnStarted = ipcRenderer.on('updateOnStarted', (event: any) => {
    alert('updateOnStarted');
  });

  updateOnCancel = ipcRenderer.on('updateOnCancel', (event: any) => {
    alert('updateOnCancel');
  });

  updateOnProgress = ipcRenderer.on('updateOnProgress', (event: any) => {
    alert('updateOnProgress');
  });

  updateInstallerDownloadOnSccess = ipcRenderer.on('updateInstallerDownloadOnSccess', (event: any, savePath: string) => {
    try {
      execFileSync(savePath);
      remote.getCurrentWindow().destroy();
    } catch (error) {
      alert(`${APP_NAME}のアップデートに失敗しました。`);
      remote.getCurrentWindow().destroy();
      return;
    }
  });

  updateInstallerDownloadOnFailed = ipcRenderer.on(
    'updateInstallerDownloadOnFailed',
    async (event: any, errorMessage: string) => {
      alert(errorMessage);
    }
  );

  _showMessageBox = (message: any) => {
    remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: APP_NAME,
      type: 'info',
      buttons: ['OK'],
      message
    });
  };

  handleActiveIndexUpdate = async (event: React.ChangeEvent<{}>, activeIndex: number) => {
    const { dispatch } = this.props;
    this.setState({ activeIndex });

    // 同じタブを複数押下した場合
    if (this.state.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        await dispatch(getUserListAction(250));
        break;

      // 社員情報タブを選択
      case 1:
        await dispatch(getRestroomUsageAction(250));
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
            <MaterialThemeProvider theme={tabTheme}>
              <Tabs
                value={this.state.activeIndex}
                variant='fullWidth'
                onChange={this.handleActiveIndexUpdate}
                style={{ minHeight: '35px' }}
                indicatorColor='primary'
                textColor='primary'
                className='app-tabs'>
                <Tab label='社員情報' style={{ minHeight: '35px' }} className='app-tab'></Tab> />
                <Tab label='社内情報' style={{ minHeight: '35px' }} className='app-tab' />
                <Tab label='設定' style={{ minHeight: '35px' }} className='app-tab' />
              </Tabs>
            </MaterialThemeProvider>
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
