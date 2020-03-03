import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Switch from '@material-ui/core/Switch';
import React from 'react';
import { Col, Form, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { APP_NAME, EMAIL_DOMAIN } from '../../define';
import { ApiResponse, UserInfo, Props, UserInfoForUpdate } from '../../define/model';
import AppModule from '../../modules/appModule';
import SettingsModule from '../../modules/settings/settingsModule';
import { AsyncActionsUserList } from '../../modules/userInfo/userListModule';
import { getUserInfo, sendHealthCheck } from '../common/functions';
import './Settings.css';
import { TextField, MenuItem } from '@material-ui/core';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class Settings extends React.Component<Props, any> {
  async componentDidMount() {
    const { dispatch } = this.props;

    // state を初期化
    dispatch(SettingsModule.actions.initializeState());

    const myUserID = this.props.state.appState.myUserID;

    // ユーザ変更(プルダウンの初期選択で自分を選択する)
    dispatch(SettingsModule.actions.setUserId(myUserID));

    // メールアドレス
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo !== null) {
      dispatch(SettingsModule.actions.setEmail(userInfo.email));
    }

    // スタートアップ
    const loginItemSettingsOptions = remote.app.getLoginItemSettings({ path: remote.app.getPath('exe') });
    if (loginItemSettingsOptions.openAtLogin) {
      dispatch(SettingsModule.actions.changeEnabledStartup(true));
    } else {
      dispatch(SettingsModule.actions.changeEnabledStartup(false));
    }
  }

  // ユーザ変更
  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    const changedUserID = parseInt(event.target.value);
    const userList = this.props.state.userListState.userList;

    const userInfo = getUserInfo(userList, changedUserID);
    if (userInfo === null) {
      return;
    }

    dispatch(SettingsModule.actions.setUserId(changedUserID));

    if (changedUserID !== -1 && changedUserID !== myUserID) {
      dispatch(SettingsModule.actions.changeDisabledSubmitButtonUserChange(false));
    }
  };

  // ユーザ変更の保存
  onSaveSettingsForUserChange = async (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    const settingState = this.props.state.settingsState;
    const oldMyUserID = this.props.state.appState.myUserID;
    let changedUserID = settingState.user.userID;

    if (changedUserID === -1 || changedUserID === oldMyUserID) {
      return;
    }

    // メールアドレス
    const myUserID = changedUserID;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null) {
      this.showSnackBar('設定の保存に失敗しました。');
      return;
    }

    electronStore.set('userID', changedUserID);
    dispatch(SettingsModule.actions.setEmail(userInfo.email));
    dispatch(AppModule.actions.setMyUserId(myUserID));
    this.showSnackBar('設定を保存しました。');
    dispatch(SettingsModule.actions.changeDisabledSubmitButtonUserChange(true));

    sendHealthCheck(dispatch);
  };

  // メールアドレスの変更
  onUserEmailInputChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(SettingsModule.actions.setEmail(event.currentTarget.value));

    if (this.props.state.settingsState.submitButtonsDisable.user.email) {
      dispatch(SettingsModule.actions.changeDisabledSubmitButtonEmail(false));
    }
  };

  // メールアドレスの保存
  onSaveSettingsForEmail = async (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    const settingState = this.props.state.settingsState;
    const myUserID = this.props.state.appState.myUserID;
    let response: ApiResponse;

    const updatedUserInfo: UserInfoForUpdate = {};
    updatedUserInfo['email'] = settingState.user.email;
    response = await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
    if (response.getIsError()) {
      this.showSnackBar('設定の保存に失敗しました。');
    } else {
      this.showSnackBar('設定を保存しました。');
      dispatch(SettingsModule.actions.changeDisabledSubmitButtonEmail(true));
    }
  };

  // スタートアップの変更と保存
  changeAndSaveStartup = async (event: any) => {
    const { dispatch } = this.props;

    await dispatch(SettingsModule.actions.changeEnabledStartup(event.target.checked));
    const settingState = this.props.state.settingsState;
    let openAtLogin: boolean;
    if (settingState.system.startupEnabled) {
      openAtLogin = true;
    } else {
      openAtLogin = false;
    }
    remote.app.setLoginItemSettings({
      openAtLogin
    });

    this.showSnackBar('設定を保存しました。');
  };

  onSnackBarClose = (event: any | MouseEvent, reason?: string) => {
    const { dispatch } = this.props;
    if (reason === 'clickaway') {
      return;
    }
    dispatch(SettingsModule.actions.changeEnabledSnackbar(false));
  };

  showSnackBar = (message: string) => {
    const { dispatch } = this.props;
    const settingState = this.props.state.settingsState;

    if (settingState.snackbar.queueMessages.length > 0) {
      return;
    }

    if (settingState.snackbar.enabled) {
      // 現在表示されているsnackbarを破棄して、新しいsnackbarを表示する
      dispatch(SettingsModule.actions.enqueueSnackbarMessages(message));
      dispatch(SettingsModule.actions.changeEnabledSnackbar(false));
    } else {
      dispatch(SettingsModule.actions.changeEnabledSnackbar([true, message]));
    }
  };

  onSnackBarExited = () => {
    const { dispatch } = this.props;
    const settingState = this.props.state.settingsState;
    const queueMessages = [...settingState.snackbar.queueMessages];

    if (queueMessages.length > 0) {
      const message = queueMessages.shift();
      dispatch(SettingsModule.actions.dequeueSnackbarMessages());
      dispatch(SettingsModule.actions.changeEnabledSnackbar([true, message]));
    }
  };

  resizeWindow = () => {
    remote.getCurrentWindow().setSize(1200, 750);
  };

  render() {
    const myUserID = this.props.state.appState.myUserID;
    const userList = JSON.parse(JSON.stringify(this.props.state.userListState.userList));
    const userInfo = getUserInfo(userList, myUserID) || new UserInfo();
    const settingState = this.props.state.settingsState;

    return (
      <div className='settings'>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={settingState.snackbar.timeoutMs}
          open={settingState.snackbar.enabled}
          onClose={this.onSnackBarClose}
          onExited={this.onSnackBarExited}
          message={settingState.snackbar.message}
        />
        <Row className='settings_user'>
          <Col md='1' />
          <Col md='10'>
            <h4>ユーザ</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>ユーザ変更</Form.Label>
                    <p>
                      <small className='text-muted'>現在のユーザ: {userInfo.name}</small>
                    </p>
                    <TextField
                      select
                      name='user-change'
                      value={settingState.user.userID}
                      onChange={this.onUserChange}
                      style={{ width: 250 }}
                      size={'small'}
                      SelectProps={{
                        native: false
                      }}
                      disabled={userList.length === 0}>
                      {userList
                        .sort((a: UserInfo, b: UserInfo) => {
                          return a.order - b.order;
                        })
                        .map((userInfo: UserInfo, index: number) => (
                          <MenuItem key={index} value={userInfo.id} disabled={myUserID === userInfo.id}>
                            {userInfo.name}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Form.Group>
                  <Form.Group as={Col} />
                </Form.Row>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={this.onSaveSettingsForUserChange}
                  disabled={settingState.submitButtonsDisable.user.userChange}
                  style={{ boxShadow: 'none' }}
                  className='settings-save-button'>
                  変更
                </Button>
              </ListGroup.Item>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>メールアドレス</Form.Label>
                    <p>
                      <small className='text-muted'>社員情報からGoogleカレンダーを表示する事ができます。</small>
                    </p>
                    <div className='form-inline'>
                      <TextField
                        name='email'
                        value={settingState.user.email}
                        onChange={this.onUserEmailInputChange}
                        size={'small'}
                        inputProps={{
                          maxLength: 100
                        }}
                        disabled={userInfo.id === -1}
                      />
                      {EMAIL_DOMAIN}
                    </div>
                  </Form.Group>
                </Form.Row>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={this.onSaveSettingsForEmail}
                  disabled={settingState.submitButtonsDisable.user.email}
                  style={{ boxShadow: 'none' }}
                  className='settings-save-button'>
                  保存
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='1' />
        </Row>
        <Row className='settings_system'>
          <Col md='1' />
          <Col md='10'>
            <h4>システム</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col} controlId='startup'>
                    <Form.Label>スタートアップ</Form.Label>
                    <p>
                      <small className='text-muted'>有効にすると、PCを起動した際に自動的に{APP_NAME}が起動します。</small>
                    </p>
                    <Switch
                      checked={settingState.system.startupEnabled}
                      onChange={this.changeAndSaveStartup}
                      color='primary'
                      className='settings-switch'
                    />
                  </Form.Group>
                </Form.Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>ウインドウの大きさをデフォルトに戻す</Form.Label>
                  </Form.Group>
                </Form.Row>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={this.resizeWindow}
                  style={{ boxShadow: 'none' }}
                  className='settings-save-button'>
                  設定
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='1' />
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(Settings);
