import MaterialUiButton from '@material-ui/core/Button';
import $ from 'jquery';
import React from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { APP_VERSION, USER_STATUS } from '../define';
import { ApiResponse, UserInfo, Props } from '../define/model';
import AppModule from '../modules/appModule';
import initialStartupModalModule from '../modules/initialStartupModalModule';
import { AsyncActionsUserList } from '../modules/userInfo/userListModule';
import { getUserInfo, sendHeartbeat } from './common/functions';
import './InitialStartupModal.css';
import { Backdrop, Fade, Modal } from '@material-ui/core';

const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends React.Component<Props, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  componentDidUpdate() {
    this.onRendered();
  }

  onRendered() {
    $('.nameForInput').focus();
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalModule.actions.showModal(false));
  };

  _addUser = async () => {
    const { dispatch } = this.props;
    let response: ApiResponse;

    this.userInfo['version'] = APP_VERSION;
    this.userInfo['status'] = USER_STATUS.s01;

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
    const addedUserInfo: any = {};
    addedUserInfo['order'] = myUserID;

    await dispatch(AsyncActionsUserList.updateForAddedUserInfoAction(addedUserInfo, myUserID));
    dispatch(AsyncActionsUserList.getUserListAction(myUserID));

    sendHeartbeat(dispatch);

    this.closeModal();
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    const myUserID = this.userID;
    const userList = this.props.state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    let response: ApiResponse;

    if (userInfo === null) {
      return;
    }

    electronStore.set('userID', myUserID);
    dispatch(AppModule.actions.setMyUserId(myUserID));

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    if (userInfo['version'] !== APP_VERSION) {
      updatedUserInfo['version'] = APP_VERSION;
      response = await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
      if (response.getIsError()) {
        return;
      }
    }

    // 状態を「在席」に更新する（更新日時も更新される）
    if (
      userInfo['status'] === USER_STATUS.s02 ||
      userInfo['status'] === USER_STATUS.s01 ||
      userInfo['status'] === USER_STATUS.s13
    ) {
      updatedUserInfo['status'] = USER_STATUS.s01;
      updatedUserInfo['name'] = userInfo['name'];
      response = await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
      if (response.getIsError()) {
        return;
      }
    }

    this.closeModal();

    dispatch(AsyncActionsUserList.getUserListAction(myUserID, 250));
    sendHeartbeat(dispatch);
  };

  onNameChange = (event: any) => {
    const { dispatch } = this.props;
    this.userInfo[event.currentTarget.name] = event.currentTarget.value;
    if (event.currentTarget.value.length > 0 && this.props.state.initialStartupModalState.submitButtonDisabled === true) {
      dispatch(initialStartupModalModule.actions.disableSubmitButton(false));
      return;
    }
    if (event.currentTarget.value.length === 0 && this.props.state.initialStartupModalState.submitButtonDisabled === false) {
      dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
      return;
    }
  };

  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    this.userID = parseInt(event.currentTarget.value);
    dispatch(initialStartupModalModule.actions.disableSubmitButton(false));
  };

  handleSubmit = (event: any) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
    event.preventDefault();

    if (this.props.state.initialStartupModalState.isChangeUser) {
      this._changeUser();
    } else {
      this._addUser();
    }
  };

  changeUserInput = (event: any) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalModule.actions.disableSubmitButton(true));
    dispatch(initialStartupModalModule.actions.changeSubmitMode(true));
    // ユーザ一覧は表示されていないため退社チェックは実行されなくても問題ない
    dispatch(AsyncActionsUserList.getUserListAction(-1, 250, false));
  };

  registUserInput = (event: any) => {
    const { dispatch } = this.props;
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
        }}
        onRendered={this.onRendered}>
        <Fade in={onHide}>
          <div className={'initial-startup-modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              ユーザ登録
              {isError && <span className='error-message'>通信に失敗しました。</span>}
              <hr />
              <Container>
                <Form.Row>
                  <Col md='2' />
                  <Col md='8'>
                    <Form.Group controlId='name'>
                      <Form.Label>氏名</Form.Label>
                      {this.props.state.initialStartupModalState.isChangeUser && (
                        <div>
                          <Form.Control name='name' as='select' onChange={this.onUserChange}>
                            <option hidden>選択してください</option>
                            {userList
                              .sort((a: UserInfo, b: UserInfo) => {
                                return a.order - b.order;
                              })
                              .map((userInfo: UserInfo, index: number) => (
                                <option key={index} value={userInfo['id']}>
                                  {userInfo['name']}
                                </option>
                              ))}
                          </Form.Control>
                          <Form.Text>
                            <span>新規登録は</span>
                            <Button variant='link' className='modal-button-user-delete userChange' onClick={this.registUserInput}>
                              こちら
                            </Button>
                          </Form.Text>
                        </div>
                      )}
                      {!this.props.state.initialStartupModalState.isChangeUser && (
                        <div>
                          <Form.Control
                            className='nameForInput'
                            name='name'
                            placeholder='氏名を入力してください'
                            onChange={this.onNameChange}
                            maxLength={100}
                          />
                          <Form.Text>
                            <span>登録済みの場合は</span>
                            <Button variant='link' className='modal-button-user-delete userChange' onClick={this.changeUserInput}>
                              こちら
                            </Button>
                          </Form.Text>
                        </div>
                      )}
                    </Form.Group>
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
