import React from 'react';
import './Settings.css';
import store from '../store/configureStore';
import { Col, Row, Form, ListGroup } from 'react-bootstrap';
import Switch from '@material/react-switch';
import MaterialButton from '@material/react-button';
import { Snackbar } from '@material/react-snackbar';
import { UserInfo } from '../define/model';
import { setMyUserIDActionCreator, updateUserInfoAction, getUserListAction } from '../actions/userList';
import {
  setUserIDActionCreator,
  changeDisabledSubmitButtonUserChangeActionCreator,
  changeDisabledSubmitButtonEmailActionCreator,
  changeEnabledStartupActionCreator,
  setEmailActionCreator,
  changeEnabledSnackbarActionCreator,
  initializeSettingStateActionCreator
} from '../actions/settings';
import { EMAIL_DOMAIN } from '../define';
import { getUserInfo } from './common/functions';
const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class Settings extends React.Component<any, any> {
  async componentDidMount() {
    const { dispatch } = this.props;

    // state を初期化
    dispatch(initializeSettingStateActionCreator());

    // メールアドレス
    const myUserID = store.getState().userListState.myUserID;
    const userList = store.getState().userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo !== null) {
      dispatch(setEmailActionCreator(userInfo.email));
    }

    // スタートアップ
    const loginItemSettingsOptions = remote.app.getLoginItemSettings({ path: remote.app.getPath('exe') });
    if (loginItemSettingsOptions.openAtLogin) {
      dispatch(changeEnabledStartupActionCreator(true));
    } else {
      dispatch(changeEnabledStartupActionCreator(false));
    }
  }

  // ユーザ変更
  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    const myUserID = store.getState().userListState.myUserID;
    const changedUserID = parseInt(event.target.value);
    const userList = store.getState().userListState.userList;

    const userInfo = getUserInfo(userList, changedUserID);
    if (userInfo === null) {
      return;
    }

    dispatch(setUserIDActionCreator(changedUserID));

    if (changedUserID !== -1 && changedUserID !== myUserID) {
      dispatch(changeDisabledSubmitButtonUserChangeActionCreator(false));
    }
  };

  // ユーザ変更の保存
  onSaveSettingsForUserChange = async (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    const settingState = store.getState().settingsState;
    const oldMyUserID = store.getState().userListState.myUserID;
    let changedUserID = settingState.user.userID;

    if (changedUserID !== -1 && changedUserID !== oldMyUserID) {
      electronStore.set('userID', changedUserID);
      await dispatch(setMyUserIDActionCreator(changedUserID));
      await dispatch(getUserListAction());

      // メールアドレス
      const myUserID = store.getState().userListState.myUserID;
      const userList = store.getState().userListState.userList;
      const userInfo = getUserInfo(userList, myUserID);
      if (userInfo !== null) {
        dispatch(setEmailActionCreator(userInfo.email));
      }

      dispatch(changeEnabledSnackbarActionCreator(true, '設定を保存しました。'));
      dispatch(changeDisabledSubmitButtonUserChangeActionCreator(true));
    }
  };

  // メールアドレスの変更
  onUserEmailInputChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(setEmailActionCreator(event.currentTarget.value));

    if (store.getState().settingsState.submitButtonsDisable.user.email) {
      dispatch(changeDisabledSubmitButtonEmailActionCreator(false));
    }
  };

  // メールアドレスの保存
  onSaveSettingsForEmail = async (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    const settingState = store.getState().settingsState;
    const myUserID = store.getState().userListState.myUserID;

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['email'] = settingState.user.email;
    await dispatch(updateUserInfoAction(updatedUserInfo, myUserID));
    if (store.getState().userListState.isError.status) {
      dispatch(changeEnabledSnackbarActionCreator(true, '設定の保存に失敗しました。'));
    } else {
      dispatch(changeEnabledSnackbarActionCreator(true, '設定を保存しました。'));
      dispatch(changeDisabledSubmitButtonEmailActionCreator(true));
    }
  };

  // スタートアップの変更と保存
  changeAndSaveStartup = async (event: any) => {
    const { dispatch } = this.props;

    await dispatch(changeEnabledStartupActionCreator(event.target.checked));
    const settingState = store.getState().settingsState;
    let openAtLogin: boolean;
    if (settingState.system.startupEnabled) {
      openAtLogin = true;
      electronStore.set('startup.enabled', 1);
    } else {
      openAtLogin = false;
      electronStore.set('startup.enabled', 0);
    }
    remote.app.setLoginItemSettings({
      openAtLogin
    });

    dispatch(changeEnabledSnackbarActionCreator(true, '設定を保存しました。'));
  };

  onSnackBarClose = () => {
    const { dispatch } = this.props;
    dispatch(changeEnabledSnackbarActionCreator(false));
  };

  render() {
    const myUserID = store.getState().userListState.myUserID;
    const userList = store.getState().userListState.userList;
    const userInfo = getUserInfo(userList, myUserID) || new UserInfo();
    const settingState = store.getState().settingsState;

    return (
      <div className='settings'>
        <Snackbar
          className='settings-snackbar'
          message={settingState.snackbar.message}
          onClose={this.onSnackBarClose}
          timeoutMs={settingState.snackbar.timeoutMs}
          open={settingState.snackbar.enabled}
        />
        <Row className='setting_user'>
          <Col md='2' />
          <Col md='8'>
            <h4>ユーザ</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>ユーザ変更</Form.Label>
                    <p>
                      <small className='text-muted'>現在のユーザ: {userInfo.name}</small>
                    </p>
                    <Form.Control name='user-change' as='select' onChange={this.onUserChange} value={myUserID}>
                      {userList
                        .sort((a: UserInfo, b: UserInfo) => {
                          return a.order - b.order;
                        })
                        .map((userInfo: UserInfo, index: number) => (
                          <option key={index} value={userInfo.id} disabled={myUserID === userInfo.id}>
                            {userInfo['name']}
                          </option>
                        ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group as={Col} />
                </Form.Row>
                <MaterialButton
                  outlined
                  type='submit'
                  className='modal-button button-submit button-save'
                  onClick={this.onSaveSettingsForUserChange}
                  disabled={settingState.submitButtonsDisable.user.userChange}>
                  保存
                </MaterialButton>
              </ListGroup.Item>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>メールアドレス</Form.Label>
                    <p>
                      <small className='text-muted'>社員情報からGoogleカレンダーを表示する事ができます。</small>
                    </p>
                    <div className='form-inline'>
                      <Form.Control
                        name='email'
                        placeholder=''
                        value={settingState.user.email}
                        onChange={this.onUserEmailInputChange}
                        maxLength={100}
                        disabled={userInfo.id === -1}
                      />
                      {EMAIL_DOMAIN}
                    </div>
                  </Form.Group>
                </Form.Row>
                <MaterialButton
                  outlined
                  type='submit'
                  className='modal-button button-submit button-save'
                  onClick={this.onSaveSettingsForEmail}
                  disabled={settingState.submitButtonsDisable.user.email}>
                  保存
                </MaterialButton>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
        <Row className='setting_system'>
          <Col md='2' />
          <Col md='8'>
            <h4>システム</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col} controlId='startup'>
                    <Form.Label>スタートアップ</Form.Label>
                    <p>
                      <small className='text-muted'>有効にすると、PCを起動した際に自動的に行き先掲示板が起動します。</small>
                    </p>
                    <Switch
                      className='switch-base'
                      checked={settingState.system.startupEnabled}
                      onChange={this.changeAndSaveStartup}
                    />
                  </Form.Group>
                </Form.Row>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
      </div>
    );
  }
}

export default Settings;
