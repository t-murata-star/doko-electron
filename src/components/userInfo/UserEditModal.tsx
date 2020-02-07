import { Fade, Tooltip, Button } from '@material-ui/core';
import $ from 'jquery';
import React from 'react';
import { Modal, Backdrop } from '@material-ui/core';
import { connect } from 'react-redux';
import { ApiResponse, Props, UserInfo } from '../../define/model';
import AppModule from '../../modules/appModule';
import UserEditModalMdule from '../../modules/userInfo/userEditModalMdule';
import { AsyncActionsUserList } from '../../modules/userInfo/userListModule';
import { showMessageBoxWithReturnValue } from '../common/functions';
import './UserEditModal.css';
import { Container, Form, Col } from 'react-bootstrap';
import { STATUS_LIST } from '../../define';

const Store = window.require('electron-store');
const electronStore = new Store();

class UserEditModal extends React.Component<Props, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  componentDidUpdate() {
    this.userInfo = { ...this.props.state.userEditModalState.userInfo };
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(UserEditModalMdule.actions.closeUserEditModal());
  };

  _updateUserInfo = async (userInfo: UserInfo) => {
    const { dispatch } = this.props;
    const userID = this.props.state.userEditModalState.userID;
    let response: ApiResponse;

    response = await dispatch(AsyncActionsUserList.updateUserInfoAction(userInfo, userID));
    if (response.getIsError()) {
      dispatch(UserEditModalMdule.actions.enableSubmitButton());
      return;
    }
    this.closeModal();

    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
    const myUserID = this.props.state.appState.myUserID;
    await dispatch(AsyncActionsUserList.getUserListAction(myUserID, 250));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    electronStore.set('userID', this.userID);
    await dispatch(AppModule.actions.setMyUserId(this.userID));
    this.closeModal();
    const myUserID = this.props.state.appState.myUserID;
    dispatch(AsyncActionsUserList.getUserListAction(myUserID, 250));
  };

  onUserInfoChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(UserEditModalMdule.actions.changeUserInfo([this.userInfo, event.target.name, event.target.value]));
    if (this.props.state.userEditModalState.submitButtonDisabled) {
      dispatch(UserEditModalMdule.actions.enableSubmitButton());
    }
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(UserEditModalMdule.actions.disableSubmitButton());
    this._updateUserInfo(this.userInfo);
  };

  handleEditUser = (event: any) => {
    const { dispatch } = this.props;
    dispatch(UserEditModalMdule.actions.handleEditUser());
  };

  deleteUser = async (event: any) => {
    const { dispatch } = this.props;
    let response: ApiResponse;

    const index = showMessageBoxWithReturnValue(
      'OK',
      'Cancel',
      '以下のユーザを一覧から削除しますか？\n\n' + this.userInfo['name']
    );

    if (index !== 0) {
      return;
    }

    const selectedUserId = this.props.state.userEditModalState.userInfo['id'];
    response = await dispatch(AsyncActionsUserList.deleteUserAction(selectedUserId));
    if (response.getIsError()) {
      return;
    }

    this.closeModal();

    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
    const myUserID = this.props.state.appState.myUserID;
    await dispatch(AsyncActionsUserList.getUserListAction(myUserID, 250));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  inputClear = () => {
    const { dispatch } = this.props;
    dispatch(UserEditModalMdule.actions.inputClear(this.userInfo));
    dispatch(UserEditModalMdule.actions.enableSubmitButton());
  };

  render() {
    const userList = this.props.state.userListState;
    const userInfo = this.props.state.userEditModalState.userInfo;

    return (
      <Modal
        aria-labelledby='contained-modal-title-vcenter'
        aria-describedby='spring-modal-description'
        className={'modal'}
        open={this.props.state.userEditModalState.onHide}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 200
        }}>
        <Fade in={this.props.state.userEditModalState.onHide}>
          <div className={'modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              <h3>情報変更</h3>
              {userList.isError && <span className='error-message'>通信に失敗しました。</span>}
              <hr />
              <Container>
                <Form.Row>
                  <Form.Group as={Col} controlId='name'>
                    <Form.Label>
                      <span className='name'>氏名</span>
                    </Form.Label>
                    <Form.Control
                      name='name'
                      placeholder=''
                      value={userInfo.name}
                      onChange={this.onUserInfoChange}
                      maxLength={100}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='status'>
                    <Form.Label>
                      <span className='status'>状態</span>
                    </Form.Label>
                    <Tooltip
                      title={<span className='user-edit-modal-tooltip'>状態を在席に変更し、行き先と戻りを削除します</span>}
                      placement='top'
                      arrow>
                      <Button
                        variant='outlined'
                        color='default'
                        size='small'
                        onClick={this.inputClear}
                        style={{ maxHeight: '28px', boxShadow: 'none' }}
                        className='user-edit-modal-presence-button'>
                        在席
                      </Button>
                    </Tooltip>
                    <Form.Control name='status' as='select' value={userInfo.status} onChange={this.onUserInfoChange}>
                      {STATUS_LIST.map((status: string, index: number) => (
                        <option key={index}>{status}</option>
                      ))}
                      <option hidden>{userInfo.status}</option>
                    </Form.Control>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} controlId='destination'>
                    <Form.Label>行き先</Form.Label>
                    <Form.Control
                      name='destination'
                      placeholder=''
                      value={userInfo.destination}
                      onChange={this.onUserInfoChange}
                      maxLength={100}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='return'>
                    <Form.Label>戻り</Form.Label>
                    <Form.Control
                      name='return'
                      placeholder=''
                      value={userInfo.return}
                      onChange={this.onUserInfoChange}
                      maxLength={100}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Group controlId='message'>
                  <Form.Label>メッセージ</Form.Label>
                  <Form.Control
                    name='message'
                    placeholder=''
                    value={userInfo.message}
                    onChange={this.onUserInfoChange}
                    maxLength={100}
                  />
                </Form.Group>
              </Container>
              <hr />
              <Button
                variant='outlined'
                color='default'
                onClick={this.deleteUser}
                style={{ marginRight: 'auto', boxShadow: 'none' }}
                className='user-edit-modal-delete-button'>
                削除
              </Button>
              <Button
                variant='contained'
                color='primary'
                type='submit'
                disabled={this.props.state.userEditModalState.submitButtonDisabled}
                style={{ float: 'right', boxShadow: 'none' }}
                className='user-edit-modal-base-button'>
                登録
              </Button>
              <Button
                variant='outlined'
                color='default'
                onClick={this.closeModal}
                className='user-edit-modal-base-button'
                style={{ float: 'right', boxShadow: 'none' }}>
                キャンセル
              </Button>
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

export default connect(mapStateToProps)(UserEditModal);
