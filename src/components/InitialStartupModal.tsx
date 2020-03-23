import MaterialUiButton from '@material-ui/core/Button';
import React from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { APP_VERSION, USER_STATUS_INFO } from '../define';
import { ApiResponse, UserInfo, Props, UserInfoForUpdate } from '../define/model';
import AppModule from '../modules/appModule';
import initialStartupModalModule from '../modules/initialStartupModalModule';
import { AsyncActionsUserList } from '../modules/userInfo/userListModule';
import { getUserInfo, sendHealthCheck } from './common/functions';
import './InitialStartupModal.css';
import { Backdrop, Fade, Modal, TextField } from '@material-ui/core';

const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends React.Component<Props, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  initializeField() {
    this.userID = -1;
    this.userInfo = new UserInfo();
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalModule.actions.showModal(false));
  };

  _addUser = async () => {
    const { dispatch } = this.props;
    let response: ApiResponse;

    this.userInfo.version = APP_VERSION;
    this.userInfo.status = USER_STATUS_INFO.s01.status;

    // addUserAction で appState の myUserID に新規ユーザIDが設定される
    response = await dispatch(AsyncActionsUserList.addUserAction(this.userInfo));
    if (response.getIsError()) {
      dispatch(initialStartupModalModule.actions.disableSubmitButton(false));
      return;
    }

    const myUserID = response.getPayload();
    dispatch(AppModule.actions.setMyUserId(myUserID));

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', myUserID);

    // orderパラメータをidと同じ値に更新する
    const addedUserInfo: UserInfoForUpdate = {};
    addedUserInfo.order = myUserID;

    await dispatch(AsyncActionsUserList.updateUserInfoAction(addedUserInfo, myUserID));
    dispatch(AsyncActionsUserList.getUserListAction(myUserID));

    sendHealthCheck(dispatch);

    this.closeModal();
    this.initializeField();
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    const myUserID = this.userID;
    const userList = this.props.state.userListState.userList;
    const userInfo = getUserInfo(userList, myUserID);
    let response: ApiResponse;

    if (userInfo === null) {
      return;
    }

    electronStore.set('userID', myUserID);
    dispatch(AppModule.actions.setMyUserId(myUserID));

    const updatedUserInfo: UserInfoForUpdate = {};
    if (userInfo.version !== APP_VERSION) {
      updatedUserInfo.version = APP_VERSION;
      response = await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
      if (response.getIsError()) {
        return;
      }
    }

    // 状態を「在席」に更新する（更新日時も更新される）
    if (
      userInfo.status === USER_STATUS_INFO.s02.status ||
      userInfo.status === USER_STATUS_INFO.s01.status ||
      userInfo.status === USER_STATUS_INFO.s13.status
    ) {
      updatedUserInfo.status = USER_STATUS_INFO.s01.status;
      updatedUserInfo.name = userInfo.name;
      response = await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
      if (response.getIsError()) {
        return;
      }
    }

    this.closeModal();

    dispatch(AsyncActionsUserList.getUserListAction(myUserID, 350));
    sendHealthCheck(dispatch);
    this.initializeField();
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    this.userInfo[event.target.name] = event.target.value;
    if (event.target.value.length > 0 && this.props.state.initialStartupModalState.submitButtonDisabled === true) {
      dispatch(initialStartupModalModule.actions.disableSubmitButton(false));
      return;
    }
    if (event.target.value.length === 0 && this.props.state.initialStartupModalState.submitButtonDisabled === false) {
      dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
      return;
    }
  };

  onUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    this.userID = parseInt(event.target.value);
    dispatch(initialStartupModalModule.actions.disableSubmitButton(false));
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
    event.preventDefault();

    if (this.props.state.initialStartupModalState.isChangeUser) {
      this._changeUser();
    } else {
      this._addUser();
    }
  };

  changeUserInput = () => {
    const { dispatch } = this.props;
    this.initializeField();
    dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
    dispatch(initialStartupModalModule.actions.changeSubmitMode(true));
    // ユーザ一覧は表示されていないため退社チェックは実行されなくても問題ない
    dispatch(AsyncActionsUserList.getUserListAction(-1, 350, false));
  };

  registUserInput = () => {
    const { dispatch } = this.props;
    this.initializeField();
    dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
    dispatch(initialStartupModalModule.actions.changeSubmitMode(false));
  };

  render() {
    const onHide = this.props.state.initialStartupModalState.onHide;
    const isError = this.props.state.userListState.isError;
    const userList = JSON.parse(JSON.stringify(this.props.state.userListState.userList));

    return (
      <Modal
        aria-labelledby='contained-modal-title-vcenter'
        aria-describedby='spring-modal-description'
        className={'modal'}
        open={onHide}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 200
        }}>
        <Fade in={onHide}>
          <div className={'initial-startup-modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              <span className='modal-title'>ユーザ登録</span>
              {isError && <span className='error-message'>通信に失敗しました。</span>}
              <hr />
              <Container>
                <Form.Row>
                  <Col md='2' />
                  <Col md='8'>
                    <Form.Label>氏名</Form.Label>
                    {this.props.state.initialStartupModalState.isChangeUser && (
                      <div>
                        <TextField
                          select
                          value={this.userID}
                          onChange={this.onUserChange}
                          fullWidth
                          size={'small'}
                          SelectProps={{
                            native: true
                          }}
                          disabled={userList.length === 0}>
                          {userList.length > 0 && (
                            <option hidden value='-1'>
                              選択してください
                            </option>
                          )}
                          {userList.length === 0 && (
                            <option hidden value='-1'>
                              ユーザが存在しません
                            </option>
                          )}
                          {userList
                            .sort((a: UserInfo, b: UserInfo) => {
                              return a.order - b.order;
                            })
                            .map((userInfo: UserInfo, index: number) => (
                              <option key={index} value={userInfo.id}>
                                {userInfo.name}
                              </option>
                            ))}
                        </TextField>
                        <Form.Text>
                          <span>新規登録は</span>
                          <Button variant='link' className='userChange' onClick={this.registUserInput}>
                            こちら
                          </Button>
                        </Form.Text>
                      </div>
                    )}
                    {!this.props.state.initialStartupModalState.isChangeUser && (
                      <div>
                        <TextField
                          className='nameForInput'
                          name='name'
                          placeholder='氏名を入力してください'
                          onChange={this.onNameChange}
                          size={'small'}
                          fullWidth
                          inputProps={{
                            maxLength: 100
                          }}
                          autoFocus={true}
                        />
                        <Form.Text>
                          <span>登録済みの場合は</span>
                          <Button variant='link' className='userChange' onClick={this.changeUserInput}>
                            こちら
                          </Button>
                        </Form.Text>
                      </div>
                    )}
                  </Col>
                  <Col md='2' />
                </Form.Row>
              </Container>
              <hr />
              <MaterialUiButton
                type='submit'
                variant='contained'
                color='primary'
                disabled={this.props.state.initialStartupModalState.submitButtonDisabled}
                style={{ float: 'right', boxShadow: 'none' }}
                className='initial-startup-modal-base-button'>
                登録
              </MaterialUiButton>
            </Form>
          </div>
        </Fade>
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(InitialStartupModal);
