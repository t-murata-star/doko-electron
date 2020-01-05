import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import { loginAction, getNotificationAction, setMyUserIDActionCreator, getS3SignedUrlAction } from '../actions/app';
import { getRestroomUsageAction } from '../actions/officeInfo/officeInfo';
import {
  getUserListAction,
  returnEmptyUserListActionCreator,
  updateStateUserListActionCreator,
  updateUserInfoAction
} from '../actions/userInfo/userList';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import MenuButtonGroupForOfficeInfo from '../containers/officeInfo/MenuButtonGroupPanelForOfficeInfo';
import MenuButtonGroupForUserList from '../containers/userInfo/MenuButtonGroupPanelForUserList';
import OfficeInfo from '../containers/officeInfo/OfficeInfoPanel';
import Settings from '../containers/settings/SettingsPanel';
import UserList from '../containers/userInfo/UserListPanel';
import {
  APP_DOWNLOAD_URL,
  APP_NAME,
  APP_VERSION,
  AUTH_REQUEST_HEADERS,
  HEARTBEAT_INTERVAL_MS,
  SAVE_INSTALLER_FILENAME
} from '../define';
import { Notification, UserInfo } from '../define/model';
import store from '../store/configureStore';
import './App.scss';
import { getUserInfo, sendHeartbeat, showMessageBox, showMessageBoxWithReturnValue } from './common/functions';
import Loading from './Loading';
import { tabTheme } from './materialui/theme';
import Progress from './Progress';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();
const childProcess = window.require('child_process');
const path = require('path');

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      activeIndex: 0,
      isUpdating: false,
      fileByteSize: 0,
      receivedBytes: 0,
      progress: 0
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const userID: number = (electronStore.get('userID') as number | undefined) || -1;

    // メインプロセスに、WEBアプリケーションに接続できたことを伝える
    ipcRenderer.send('connected', true);

    await dispatch(loginAction());

    if (store.getState().appState.isError.status) {
      ipcRenderer.send('connected', false);
      remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
      return;
    }

    // APIリクエストヘッダに認証トークンを設定する
    AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + store.getState().appState.token;

    // お知らせチェック
    await dispatch(getNotificationAction());

    const notification: Notification = store.getState().appState.notification;
    const updateNotificationMessage: string = `新しい${APP_NAME}が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`;

    /**
     * バージョンチェック
     * 実行しているアプリケーションのバージョンが最新ではない場合、
     * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
     */
    if (notification.latestAppVersion !== APP_VERSION) {
      showMessageBox(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL);
      remote.getCurrentWindow().destroy();
      return;
    }

    // if (notification.latestAppVersion !== APP_VERSION) {
    //   this.setState({ isUpdating: true });
    //   const index = showMessageBoxWithReturnValue('OK', 'Cancel', updateNotificationMessage);
    //   this._updateApp(index);
    //   return;
    // }

    /**
     * スタートアップ登録処理。
     * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
     */
    if (!electronStore.get('startup.notified')) {
      const index = showMessageBoxWithReturnValue(
        'YES',
        'NO',
        `スタートアップを有効にしますか？\n※PCを起動した際に自動的に${APP_NAME}が起動します。`
      );
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

    /**
     * お知らせチェック
     * appVersion が latestAppVersion と異なる場合、アップデート後の初回起動と判断し、
     * 一度だけお知らせを表示する。
     */
    if (electronStore.get('appVersion') !== APP_VERSION) {
      showMessageBox(notification.content);
      electronStore.set('appVersion', APP_VERSION);
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

    await dispatch(getUserListAction(userID));
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
      showMessageBox('ユーザ情報が存在しないため、ユーザ登録を行います。');
      dispatch(showInitialStartupModalActionCreator());
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['version'] = APP_VERSION;

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

  electronResizeEvent = ipcRenderer.on('electronResizeEvent', async () => {
    const { dispatch } = this.props;
    const myUserID = store.getState().appState.myUserID;

    // macOSでリサイズするとレイアウトが崩れてしまう問題の暫定対処
    await this._sleep(250);

    dispatch(setMyUserIDActionCreator(-1));
    dispatch(setMyUserIDActionCreator(myUserID));
  });

  // 状態を「離席中」に更新する
  electronLockScreenEvent = ipcRenderer.on('electronLockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = store.getState().appState['myUserID'];
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
    const myUserID = store.getState().appState['myUserID'];
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

    const myUserID = store.getState().appState['myUserID'];
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

  updateOnProgress = ipcRenderer.on('updateOnProgress', (event: any, receivedBytes: number) => {
    const notification: Notification = store.getState().appState.notification;
    switch (remote.process.platform) {
      case 'win32':
        this.setState({ fileByteSize: notification.updateInstaller.windows.fileByteSize });
        this.setState({ progress: Math.round((receivedBytes / this.state.fileByteSize) * 1000) / 10 });
        this.setState({ receivedBytes: receivedBytes });
        break;

      case 'darwin':
        this.setState({ fileByteSize: notification.updateInstaller.mac.fileByteSize });
        this.setState({ progress: Math.round((receivedBytes / this.state.fileByteSize) * 1000) / 10 });
        this.setState({ receivedBytes: receivedBytes });
        break;

      default:
        showMessageBox(`使用中のPCはアップデートに対応していません。`, 'warning');
        remote.getCurrentWindow().destroy();
        break;
    }
  });

  updateInstallerDownloadOnSccess = ipcRenderer.on('updateInstallerDownloadOnSccess', (event: any, savePath: string) => {
    try {
      switch (remote.process.platform) {
        case 'win32':
          childProcess.execFileSync(savePath);
          break;

        case 'darwin':
          childProcess.execSync(`open ${savePath}`);
          break;

        default:
          break;
      }

      remote.getCurrentWindow().destroy();
    } catch (error) {
      showMessageBox(`${APP_NAME}インストーラの実行に失敗しました。`, 'warning');
      remote.getCurrentWindow().destroy();
      return;
    }
  });

  updateInstallerDownloadOnFailed = ipcRenderer.on('updateInstallerDownloadOnFailed', (event: any, errorMessage: string) => {
    const index = showMessageBoxWithReturnValue('OK', 'Cancel', `アップデートに失敗しました。\n再開しますか？`, 'warning');
    this._updateApp(index);
  });

  async _updateApp(index: number) {
    const { dispatch } = this.props;
    const notification: Notification = store.getState().appState.notification;

    let updateInstallerFilepath = '';
    switch (index) {
      case 0:
        // TODO:既にダウンロード済みの場合、そのインストーラを起動する。
        switch (remote.process.platform) {
          case 'win32':
            await dispatch(getS3SignedUrlAction(notification.updateInstaller.windows.fileName));
            if (store.getState().appState.isError.status) {
              showMessageBox(`${APP_NAME}インストーラのダウンロードに失敗しました。`, 'warning');
              remote.getCurrentWindow().destroy();
              return;
            }
            updateInstallerFilepath = `${path.join(remote.app.getPath('temp'), SAVE_INSTALLER_FILENAME)}_${APP_VERSION}.exe`;
            ipcRenderer.send('updateApp', updateInstallerFilepath, store.getState().appState.updateInstallerUrl);
            break;

          case 'darwin':
            await dispatch(getS3SignedUrlAction(notification.updateInstaller.mac.fileName));
            if (store.getState().appState.isError.status) {
              showMessageBox(`${APP_NAME}インストーラのダウンロードに失敗しました。`, 'warning');
              remote.getCurrentWindow().destroy();
              return;
            }
            updateInstallerFilepath = `${path.join(remote.app.getPath('temp'), SAVE_INSTALLER_FILENAME)}_${APP_VERSION}.dmg`;
            ipcRenderer.send('updateApp', updateInstallerFilepath, store.getState().appState.updateInstallerUrl);
            break;

          default:
            break;
        }
        break;

      default:
        remote.getCurrentWindow().destroy();
        break;
    }
  }

  handleActiveIndexUpdate = async (event: React.ChangeEvent<{}>, activeIndex: number) => {
    const { dispatch } = this.props;
    const myUserID = store.getState().appState.myUserID;
    this.setState({ activeIndex });
    // 同じタブを複数押下した場合
    if (this.state.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        await dispatch(getUserListAction(myUserID, 250));
        break;

      // 社員情報タブを選択
      case 1:
        await dispatch(getRestroomUsageAction(250));
        break;

      default:
        break;
    }
  };

// スリープ処理
_sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

  render() {
    const myUserID = store.getState().appState['myUserID'];

    return (
      <div>
        <Loading state={store.getState()} />
        <Progress
          isUpdating={this.state.isUpdating}
          fileByteSize={this.state.fileByteSize}
          receivedBytes={this.state.receivedBytes}
          progress={this.state.progress}
        />
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
