import { Fade, Snackbar } from '@material-ui/core';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { connect } from 'react-redux';
import { USER_STATUS_INFO } from '../define';
import { Props, UserInfoForUpdate } from '../define/model';
import { appSlice, appActionsAsyncLogic } from '../modules/appModule';
import { userListActionsAsyncLogic } from '../modules/userInfo/userListModule';
import './App.scss';
import {
  getUserInfo,
  onSnackBarClose,
  onSnackBarExited,
  sendHealthCheck,
  getAllOfficeInfo,
  checkResponseError,
} from './common/functions';
import InitialStartupModal from './InitialStartupModal';
import Loading from './Loading';
import { tabTheme } from './materialui/theme';
import OfficeInfo from './officeInfo/OfficeInfo';
import Settings from './settings/Settings';
import UserList from './userInfo/UserList';

const { remote, ipcRenderer } = window.require('electron');

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
};

class App extends React.Component<Props, any> {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(appActionsAsyncLogic.login());
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
    dispatch(userListActionsAsyncLogic.updateUserInfoAction(updatedUserInfo, myUserID));
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
    dispatch(userListActionsAsyncLogic.updateUserInfoAction(updatedUserInfo, myUserID));

    sendHealthCheck();
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
    await dispatch(userListActionsAsyncLogic.updateUserInfoAction(updatedUserInfo, myUserID));
    this._closeApp();
  });

  handleActiveIndexUpdate = async (event: React.ChangeEvent<{}>, activeIndex: number) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    dispatch(appSlice.actions.setActiveIndex(activeIndex));

    // 同じタブを複数押下した場合
    if (this.props.state.appState.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        checkResponseError(dispatch(userListActionsAsyncLogic.getUserListAction(myUserID, 350)));
        break;

      // 社員情報タブを選択
      case 1:
        getAllOfficeInfo();
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
          isAppStateProcessing={this.props.state.appState.isFetching}
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
    state,
  };
};

export default connect(mapStateToProps)(App);
