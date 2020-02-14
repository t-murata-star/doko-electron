import { Fade, Tooltip, Button, TextField, MenuItem } from '@material-ui/core';
import $ from 'jquery';
import React from 'react';
import { Modal, Backdrop } from '@material-ui/core';
import { connect } from 'react-redux';
import { ApiResponse, Props, UserInfo } from '../../define/model';
import UserEditModalModule from '../../modules/userInfo/userEditModalModule';
import { AsyncActionsUserList } from '../../modules/userInfo/userListModule';
import { showMessageBoxSyncWithReturnValue } from '../common/functions';
import './UserEditModal.css';
import { Container, Form, Col } from 'react-bootstrap';
import { STATUS_LIST } from '../../define';

class UserEditModal extends React.Component<Props, any> {
  userInfo: any = new UserInfo();

  componentDidUpdate() {
    this.userInfo = { ...this.props.state.userEditModalState.userInfo };
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(UserEditModalModule.actions.closeUserEditModal());
  };

  _updateUserInfo = async (userInfo: UserInfo) => {
    const { dispatch } = this.props;
    const userID = this.props.state.userEditModalState.userID;
    let response: ApiResponse;

    response = await dispatch(AsyncActionsUserList.updateUserInfoAction(userInfo, userID));
    if (response.getIsError()) {
      dispatch(UserEditModalModule.actions.enableSubmitButton());
      return;
    }
    this.closeModal();

    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
    const myUserID = this.props.state.appState.myUserID;
    await dispatch(AsyncActionsUserList.getUserListAction(myUserID, 350));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  onUserInfoChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(UserEditModalModule.actions.changeUserInfo([this.userInfo, event.target.name, event.target.value]));
    if (this.props.state.userEditModalState.submitButtonDisabled) {
      dispatch(UserEditModalModule.actions.enableSubmitButton());
    }
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(UserEditModalModule.actions.disableSubmitButton());
    this._updateUserInfo(this.userInfo);
  };

  handleEditUser = (event: any) => {
    const { dispatch } = this.props;
    dispatch(UserEditModalModule.actions.handleEditUser());
  };

  deleteUser = async (event: any) => {
    const { dispatch } = this.props;
    let response: ApiResponse;

    const index = showMessageBoxSyncWithReturnValue(
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
    await dispatch(AsyncActionsUserList.getUserListAction(myUserID, 350));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  inputClear = () => {
    const { dispatch } = this.props;
    dispatch(UserEditModalModule.actions.inputClear(this.userInfo));
    dispatch(UserEditModalModule.actions.enableSubmitButton());
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
          timeout: 300
        }}>
        <Fade in={this.props.state.userEditModalState.onHide}>
          <div className={'modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              <span className='modal-title'>情報変更</span>
              {userList.isError && <span className='error-message'>通信に失敗しました。</span>}
              <hr />
              <Container>
                <Form.Row>
                  <Form.Group as={Col} controlId='name'>
                    <Form.Label>
                      <span className='name'>氏名</span>
                    </Form.Label>
                    <TextField
                      name='name'
                      value={userInfo.name}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100
                      }}
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
                        size={'small'}
                        onClick={this.inputClear}
                        style={{ maxHeight: '28px', boxShadow: 'none' }}
                        className='user-edit-modal-presence-button'
                        tabIndex={-1}>
                        在席
                      </Button>
                    </Tooltip>
                    <TextField
                      select
                      name='status'
                      value={userInfo.status}
                      onChange={this.onUserInfoChange}
                      fullWidth
                      size={'small'}
                      SelectProps={{
                        native: false
                      }}>
                      {STATUS_LIST.map((status: string, index: number) => (
                        <MenuItem key={index} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                      <MenuItem hidden>{userInfo.status}</MenuItem>
                    </TextField>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} controlId='destination'>
                    <Form.Label>行き先</Form.Label>
                    <TextField
                      name='destination'
                      value={userInfo.destination}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100
                      }}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='return'>
                    <Form.Label>戻り</Form.Label>
                    <TextField
                      name='return'
                      value={userInfo.return}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100
                      }}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Group controlId='message'>
                  <Form.Label>メッセージ</Form.Label>
                  <TextField
                    name='message'
                    value={userInfo.message}
                    onChange={this.onUserInfoChange}
                    size={'small'}
                    fullWidth
                    inputProps={{
                      maxLength: 100
                    }}
                  />
                </Form.Group>
              </Container>
              <hr />
              <Button
                variant='outlined'
                color='default'
                onClick={this.deleteUser}
                style={{ float: 'left', boxShadow: 'none' }}
                className='user-edit-modal-delete-button'
                tabIndex={-1}>
                削除
              </Button>
              <div className='submit-button-group'>
                <Button
                  variant='outlined'
                  color='default'
                  onClick={this.closeModal}
                  className='user-edit-modal-base-button'
                  style={{ boxShadow: 'none' }}>
                  キャンセル
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  disabled={this.props.state.userEditModalState.submitButtonDisabled}
                  style={{ boxShadow: 'none' }}
                  className='user-edit-modal-base-button'>
                  登録
                </Button>
              </div>
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
