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
  changeEnabledStartupActionCreator,
  setEmailActionCreator,
  changeEnabledSnackbarActionCreator
} from '../actions/settings';
import { _SettingsState } from '../reducers/settings';
const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class Settings extends React.Component<any, any> {
  async componentDidMount() {
    const { dispatch } = this.props;

    // 各ボタンを無効化
    dispatch(changeDisabledSubmitButtonUserChangeActionCreator(true));

    // メールアドレス
    const myUserID = store.getState().userListState.myUserID;
    const userList = store.getState().userListState.userList;
    const userInfo = this._getUserInfo(userList, myUserID);
    if (userInfo !== null) {
      dispatch(setEmailActionCreator(userInfo.email));
    }

    // スタートアップ
    if (electronStore.get('startup.enabled') === 1) {
      dispatch(changeEnabledStartupActionCreator(true));
    } else {
      dispatch(changeEnabledStartupActionCreator(false));
    }
  }

  onUserEmailInputChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(setEmailActionCreator(event.currentTarget.value));

    // if (store.getState().settingsState.submitButtonDisabled) {
    //   dispatch(changeDisabledSubmitButtonActionCreator(false));
    // }
  };

  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    const myUserID = store.getState().userListState.myUserID;
    const changedUserID = parseInt(event.target.value);
    const userList = store.getState().userListState.userList;

    const userInfo = this._getUserInfo(userList, changedUserID);
    if (userInfo === null) {
      return;
    }

    dispatch(setUserIDActionCreator(changedUserID));

    if (changedUserID !== -1 && changedUserID !== myUserID) {
      dispatch(changeDisabledSubmitButtonUserChangeActionCreator(false));
    }
  };

  // 【保存】ユーザ変更
  onSaveSettingsForUserChange = async (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    const settingState = store.getState().settingsState;
    const oldMyUserID = store.getState().userListState.myUserID;
    let changedUserID = settingState.user.userID;

    if (changedUserID !== -1 && changedUserID !== oldMyUserID) {
      electronStore.set('userID', changedUserID);
      await dispatch(setMyUserIDActionCreator(changedUserID));
    }
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

  onStartupChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(changeEnabledStartupActionCreator(event.target.checked));
  };

  onSaveSettings = async (event: any) => {
    event.preventDefault();
    // const { dispatch } = this.props;
    // const settingState = store.getState().settingsState;
    // const oldMyUserID = store.getState().userListState.myUserID;
    // let newMyUserID = -1;
    // let changedUserID = settingState.user.userID;

    // const oldSettingState: _SettingsState = JSON.parse(JSON.stringify(settingState));

    // try {
    //   // ユーザ変更
    //   if (changedUserID !== -1 && changedUserID !== oldMyUserID) {
    //     electronStore.set('userID', changedUserID);
    //     await dispatch(setMyUserIDActionCreator(changedUserID));
    //     // state を更新
    //     newMyUserID = store.getState().userListState.myUserID;
    //   }

    //   const myUserID = newMyUserID === -1 ? oldMyUserID : newMyUserID;

    //   // メールアドレス
    //   const updatedUserInfo: any = {};
    //   updatedUserInfo['id'] = myUserID;
    //   updatedUserInfo['email'] = settingState.user.email;
    //   await dispatch(updateUserInfoAction(updatedUserInfo, myUserID));

    //   if (store.getState().userListState.isError.status) {
    //     throw new Error();
    //   }

    //   // スタートアップ
    //   let openAtLogin: boolean;
    //   if (settingState.system.startupEnabled) {
    //     openAtLogin = true;
    //     electronStore.set('startup.enabled', 1);
    //   } else {
    //     openAtLogin = false;
    //     electronStore.set('startup.enabled', 0);
    //   }
    //   remote.app.setLoginItemSettings({
    //     openAtLogin
    //   });

    //   await dispatch(getUserListAction());
    //   dispatch(changeDisabledSubmitButtonActionCreator(true));
    //   dispatch(changeEnabledSnackbarActionCreator(true, '設定を保存しました。'));
    // } catch (error) {
    //   // 既に保存済みの設定をロールバック
    //   // ユーザ変更
    //   electronStore.set('userID', oldMyUserID);

    //   // スタートアップ
    //   electronStore.set('startup.enabled', oldSettingState.system.startupEnabled);
    // }
  };

  onSnackBarClose = () => {
    const { dispatch } = this.props;
    dispatch(changeEnabledSnackbarActionCreator(false));
  };

  render() {
    const myUserID = store.getState().userListState.myUserID;
    const userList = store.getState().userListState.userList;
    const userInfo = this._getUserInfo(userList, myUserID) || new UserInfo();
    const settingState = store.getState().settingsState;
    const isError = store.getState().userListState.isError.status;

    return (
      <div className='settings'>
        {settingState.snackbar.enabled && (
          <Snackbar
            className='settings-snackbar'
            message={settingState.snackbar.message}
            onClose={this.onSnackBarClose}
            timeoutMs={settingState.snackbar.timeoutMs}
          />
        )}
        <Form onSubmit={this.onSaveSettings}>
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
                      <Form.Control name='user-change' as='select' onChange={this.onUserChange}>
                        <option hidden>選択してください</option>
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
                    disabled={settingState.submitButtonsDisable.userChange}>
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
                          disabled={userList.length === 0}
                        />
                        @townsystem.co.jp
                      </div>
                    </Form.Group>
                  </Form.Row>
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
                      <Switch checked={settingState.system.startupEnabled} onChange={this.onStartupChange} />
                    </Form.Group>
                  </Form.Row>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md='2' />
          </Row>
        </Form>
      </div>
    );
  }
}

export default Settings;
