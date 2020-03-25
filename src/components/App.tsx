import { Fade, Snackbar } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { connect } from 'react-redux';
import {
  APP_DOWNLOAD_URL,
  APP_NAME,
  APP_VERSION,
  AUTH_REQUEST_HEADERS,
  HEALTH_CHECK_INTERVAL_MS,
  USER_STATUS_INFO
} from '../define';
import { ApiResponse, Notification, Props, UserInfo, UserInfoForUpdate } from '../define/model';
import AppModule, { AsyncActionsApp } from '../modules/appModule';
import InitialStartupModalModule from '../modules/initialStartupModalModule';
import { AsyncActionsOfficeInfo } from '../modules/officeInfo/officeInfoModule';
import UserListModule, { AsyncActionsUserList } from '../modules/userInfo/userListModule';
import './App.scss';
import {
  getUserInfo,
  onSnackBarClose,
  onSnackBarExited,
  sendHealthCheck,
  showMessageBoxSync,
  showMessageBoxSyncWithReturnValue
} from './common/functions';
import InitialStartupModal from './InitialStartupModal';
import Loading from './Loading';
import { tabTheme } from './materialui/theme';
import OfficeInfo from './officeInfo/OfficeInfo';
import Settings from './settings/Settings';
import UserList from './userInfo/UserList';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
};

class App extends React.Component<Props, any> {
  async componentDidMount() {
    const { dispatch } = this.props;
    const userID: number = (electronStore.get('userID') as number | undefined) || -1;
    let response: ApiResponse;

    // メインプロセスに、レンダラープロセスに接続できたことを伝える
    ipcRenderer.send('connected', true);

    response = await dispatch(AsyncActionsApp.loginAction());

    if (response.getIsError()) {
      ipcRenderer.send('connected', false);
      remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
      return;
    }

    // APIリクエストヘッダに認証トークンを設定する
    AUTH_REQUEST_HEADERS.Authorization = 'Bearer ' + this.props.state.appState.token;

    // お知らせチェック
    await dispatch(AsyncActionsApp.getNotificationAction());

    const notification: Notification = this.props.state.appState.notification;
    const updateNotificationMessage: string = `新しい${APP_NAME}が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`;

    /**
     * バージョンチェック
     * 実行しているアプリケーションのバージョンが最新ではない場合、
     * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
     */
    if (notification.latestAppVersion !== APP_VERSION) {
      showMessageBoxSync(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL);
      this._closeApp();
      return;
    }

    /**
     * スタートアップ登録処理。
     * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
     */
    if (!electronStore.get('startup.notified')) {
      const index = showMessageBoxSyncWithReturnValue(
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
      showMessageBoxSync(notification.content);
      electronStore.set('appVersion', APP_VERSION);
    }

    /**
     * アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
     */
    setInterval(() => {
      sendHealthCheck(dispatch);
    }, HEALTH_CHECK_INTERVAL_MS);

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (userID === -1) {
      dispatch(InitialStartupModalModule.actions.showModal(true));
      return;
    }

    response = await dispatch(AsyncActionsUserList.getUserListAction(userID));
    if (response.getIsError()) {
      return;
    }

    const userList: UserInfo[] = JSON.parse(JSON.stringify(this.props.state.userListState.userList));
    const userInfo = getUserInfo(userList, userID);

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    if (userInfo === null) {
      return;
    }

    const updatedUserInfo: UserInfoForUpdate = {};
    if (userInfo.version !== APP_VERSION) {
      updatedUserInfo.version = APP_VERSION;
      // アプリバージョンのみ更新（更新日時も更新されない）
      dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, userID));
    }

    // 状態を「在席」に更新する（更新日時も更新される）
    if (
      userInfo.status === USER_STATUS_INFO.s02.status ||
      userInfo.status === USER_STATUS_INFO.s01.status ||
      userInfo.status === USER_STATUS_INFO.s13.status
    ) {
      userInfo.status = USER_STATUS_INFO.s01.status;
      updatedUserInfo.status = userInfo.status;
      updatedUserInfo.name = userInfo.name;
      dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, userID));
    }

    dispatch(UserListModule.actions.setUserInfo(userList));
    dispatch(AppModule.actions.setMyUserId(userID));

    sendHealthCheck(dispatch);
  }

  electronMinimizeEvent = ipcRenderer.on('electronMinimizeEvent', () => {
    remote.getCurrentWindow().hide();
  });

  // 状態を「離席中」に更新する
  electronLockScreenEvent = ipcRenderer.on('electronLockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
      return;
    }

    const updatedUserInfo: UserInfoForUpdate = {};
    updatedUserInfo.name = userInfo.name;
    updatedUserInfo.status = USER_STATUS_INFO.s13.status;
    dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
  });

  // 状態を「在席」に更新する
  electronUnlockScreenEvent = ipcRenderer.on('electronUnlockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
      return;
    }

    const updatedUserInfo: UserInfoForUpdate = {};
    updatedUserInfo.name = userInfo.name;
    updatedUserInfo.status = USER_STATUS_INFO.s01.status;
    dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));

    sendHealthCheck(dispatch);
  });

  closeApp = ipcRenderer.on('closeApp', async () => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
      this._closeApp();
      return;
    }

    const updatedUserInfo: UserInfoForUpdate = {};
    updatedUserInfo.status = USER_STATUS_INFO.s02.status;
    updatedUserInfo.name = userInfo.name;
    await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
    this._closeApp();
  });

  handleActiveIndexUpdate = async (event: React.ChangeEvent<{}>, activeIndex: number) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    dispatch(AppModule.actions.setActiveIndex(activeIndex));

    // 同じタブを複数押下した場合
    if (this.props.state.appState.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        dispatch(AsyncActionsUserList.getUserListAction(myUserID, 350));
        break;

      // 社員情報タブを選択
      case 1:
        dispatch(AsyncActionsOfficeInfo.getRestroomUsageAction(350));
        dispatch(AsyncActionsOfficeInfo.getOfficeInfoAction(350));
        break;

      default:
        break;
    }
  };

  _closeApp = () => {
    if (remote.getCurrentWindow().isDestroyed() === false) {
      remote.getCurrentWindow().destroy();
      // ipcRenderer.send('closeApp');
    }
  };

  render() {
    const myUserID = this.props.state.appState.myUserID;
    const appState = this.props.state.appState;
    return (
      <div>
        <Loading
          isAppStateProcessing={this.props.state.appState.isProcessing}
          isUserListProcessing={this.props.state.userListState.isFetching}
          officeInfoProcessing={this.props.state.officeInfoState.isFetching}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={appState.snackbar.timeoutMs}
          open={appState.snackbar.enabled}
          onClose={onSnackBarClose}
          onExited={onSnackBarExited}
          TransitionComponent={Fade}>
          <Alert severity={appState.snackbar.severity}>{appState.snackbar.message}</Alert>
        </Snackbar>
        <InitialStartupModal />
        {myUserID !== -1 && (
          <Fade in={true}>
            <div>
              <MaterialThemeProvider theme={tabTheme}>
                <Tabs
                  value={this.props.state.appState.activeIndex}
                  variant='fullWidth'
                  onChange={this.handleActiveIndexUpdate}
                  style={{ minHeight: '35px' }}
                  indicatorColor='primary'
                  textColor='primary'
                  className='app-tabs'>
                  <Tab label='社員情報' style={{ minHeight: '35px' }} className='app-tab' />
                  <Tab label='社内情報' style={{ minHeight: '35px' }} className='app-tab' />
                  <Tab label='設定' style={{ minHeight: '35px' }} className='app-tab' />
                </Tabs>
              </MaterialThemeProvider>
            </div>
          </Fade>
        )}
        <div className='contents'>
          {myUserID !== -1 && this.props.state.appState.activeIndex === 0 && (
            <Fade in={true}>
              <div>
                <UserList />
              </div>
            </Fade>
          )}
          {myUserID !== -1 && this.props.state.appState.activeIndex === 1 && (
            <Fade in={true}>
              <div>
                <OfficeInfo />
              </div>
            </Fade>
          )}
          {myUserID !== -1 && this.props.state.appState.activeIndex === 2 && (
            <Fade in={true}>
              <div>
                <Settings />
              </div>
            </Fade>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(App);
