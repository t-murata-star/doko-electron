import { Grid, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import React from 'react';
import { Col, Form, ListGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import { APP_NAME, EMAIL_DOMAIN, NO_USER, NO_USER_IN_USERLIST } from '../../define';
import { Props, UserInfo } from '../../define/model';
import { appActions } from '../../actions/appActions';
import { settingActionsAsyncLogic, settingActions } from '../../actions/settings/settingsActions';
import { getUserInfo, showSnackBar, regularExecution } from '../common/utils';
import './Settings.css';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class Settings extends React.Component<Props, any> {
  componentDidMount() {
    const { dispatch } = this.props;

    // state を初期化
    dispatch(settingActions.initializeState());

    const myUserId = this.props.state.appState.myUserId;

    // ユーザ変更(プルダウンの初期選択で自分を選択する)
    dispatch(settingActions.setUserId(myUserId));

    // メールアドレス
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserId);
    if (userInfo !== null) {
      dispatch(settingActions.setEmail(userInfo.email));
    }

    // スタートアップ
    const loginItemSettingsOptions = remote.app.getLoginItemSettings({ path: remote.app.getPath('exe') });
    if (loginItemSettingsOptions.openAtLogin) {
      dispatch(settingActions.changeEnabledStartup(true));
    } else {
      dispatch(settingActions.changeEnabledStartup(false));
    }
  }

  // ユーザ変更
  onUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    const myUserId = this.props.state.appState.myUserId;
    const changedUserId = parseInt(event.target.value, 10);
    const userList = this.props.state.userListState.userList;

    const userInfo = getUserInfo(userList, changedUserId);
    if (userInfo === null) {
      return;
    }

    dispatch(settingActions.setUserId(changedUserId));

    if (changedUserId !== NO_USER && changedUserId !== myUserId) {
      dispatch(settingActions.changeDisabledSubmitButtonUserChange(false));
    }
  };

  // ユーザ変更の保存
  onSaveSettingsForUserChange = () => {
    const { dispatch } = this.props;
    const settingState = this.props.state.settingsState;
    const oldMyUserId = this.props.state.appState.myUserId;
    const changedUserId = settingState.user.userId;

    if (changedUserId === NO_USER || changedUserId === oldMyUserId) {
      return;
    }

    // メールアドレス
    const myUserId = changedUserId;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserId);
    if (userInfo === null) {
      showSnackBar('error', '通信に失敗しました。', null);
      return;
    }

    electronStore.set('userId', changedUserId);
    dispatch(settingActions.setEmail(userInfo.email));
    dispatch(appActions.setMyUserId(myUserId));
    showSnackBar('success', '設定を保存しました。');
    dispatch(settingActions.changeDisabledSubmitButtonUserChange(true));

    regularExecution();
  };

  // メールアドレスの変更
  onUserEmailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    dispatch(settingActions.setEmail(event.currentTarget.value));

    if (this.props.state.settingsState.submitButtonsDisable.user.email) {
      dispatch(settingActions.changeDisabledSubmitButtonEmail(false));
    }
  };

  // メールアドレスの保存
  onSaveSettingsForEmail = () => {
    const { dispatch } = this.props;
    dispatch(settingActionsAsyncLogic.saveSettingsForEmail());
  };

  // スタートアップの変更と保存
  changeStartup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;

    await dispatch(settingActions.changeEnabledStartup(event.target.checked));
    const settingState = this.props.state.settingsState;
    let openAtLogin = false;
    if (settingState.system.startupEnabled) {
      openAtLogin = true;
    } else {
      openAtLogin = false;
    }
    remote.app.setLoginItemSettings({
      openAtLogin,
    });

    showSnackBar('success', '設定を保存しました。');
  };

  resizeWindow = () => {
    const resizeWindowSize = {
      width: 1200,
      height: 750,
    };
    remote.getCurrentWindow().setSize(resizeWindowSize.width, resizeWindowSize.height);
  };

  render() {
    const myUserId = this.props.state.appState.myUserId;
    const userList = JSON.parse(JSON.stringify(this.props.state.userListState.userList));
    const userInfo = getUserInfo(userList, myUserId) || new UserInfo();
    const settingState = this.props.state.settingsState;

    return (
      <div className='settings'>
        <Grid container justify='center' spacing={2} className='settings_user'>
          <Grid item xs={10}>
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
                      value={settingState.user.userId}
                      onChange={this.onUserChange}
                      style={{ width: 250 }}
                      size={'small'}
                      SelectProps={{
                        native: true,
                      }}
                      disabled={userList.length === NO_USER_IN_USERLIST}>
                      {userList
                        .sort((a: UserInfo, b: UserInfo) => {
                          return a.order - b.order;
                        })
                        .map((_userInfo: UserInfo, index: number) => (
                          <option key={index} value={_userInfo.id} disabled={myUserId === _userInfo.id}>
                            {_userInfo.name}
                          </option>
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
                          maxLength: 100,
                        }}
                        disabled={userInfo.id === NO_USER}
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
                  登録
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Grid>
        </Grid>
        <Grid container justify='center' spacing={2}>
          <Grid item xs={10}>
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
                      onChange={this.changeStartup}
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
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(Settings);
