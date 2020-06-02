import MaterialUiButton from '@material-ui/core/Button';
import React from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { UserInfo, Props } from '../define/model';
import { initialStartupModalActionsAsyncLogic, initialStartupModalActions } from '../actions/initialStartupModalActions';
import './InitialStartupModal.css';
import { Backdrop, Fade, Modal, TextField } from '@material-ui/core';

class InitialStartupModal extends React.Component<Props, any> {
  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActions.showModal(false));
  };

  addUser = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActionsAsyncLogic.addUser());
  };

  changeUser = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActionsAsyncLogic.changeUser());
  };

  onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActions.changeUserInfo(event.target.name, event.target.value));
    if (event.target.value.length > 0 && this.props.state.initialStartupModalState.disabled === true) {
      dispatch(initialStartupModalActions.disableSubmitButton(false));
      return;
    }
    if (event.target.value.length === 0 && this.props.state.initialStartupModalState.disabled === false) {
      dispatch(initialStartupModalActions.disableSubmitButton(true));
    }
  };

  onUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActions.changeUserId(parseInt(event.target.value, 10)));
    dispatch(initialStartupModalActions.disableSubmitButton(false));
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActions.disableSubmitButton(true));
    event.preventDefault();

    if (this.props.state.initialStartupModalState.isChangeUser) {
      this.changeUser();
    } else {
      this.addUser();
    }
  };

  selectFromExistingUsers = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActionsAsyncLogic.selectFromExistingUsers());
  };

  registUserInput = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModalActions.initializeField());
    dispatch(initialStartupModalActions.disableSubmitButton(true));
    dispatch(initialStartupModalActions.changeSubmitMode(false));
  };

  render() {
    const onHide = this.props.state.initialStartupModalState.onHide;
    const userList = JSON.parse(JSON.stringify(this.props.state.userListState.userList));
    const myUserId = this.props.state.initialStartupModalState.selectedUserId;

    return (
      <Modal
        aria-labelledby='contained-modal-title-vcenter'
        aria-describedby='spring-modal-description'
        className={'modal'}
        open={onHide}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 200,
        }}>
        <Fade in={onHide}>
          <div className={'initial-startup-modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              <span className='modal-title'>ユーザ登録</span>
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
                          value={myUserId}
                          onChange={this.onUserChange}
                          fullWidth
                          size={'small'}
                          SelectProps={{
                            native: true,
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
                          <Button variant='link' className='change-user-entry-type' onClick={this.registUserInput}>
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
                            maxLength: 100,
                          }}
                          autoFocus={true}
                        />
                        <Form.Text>
                          <span>登録済みの場合は</span>
                          <Button variant='link' className='change-user-entry-type' onClick={this.selectFromExistingUsers}>
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
                disabled={this.props.state.initialStartupModalState.disabled}
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
    state,
  };
};

export default connect(mapStateToProps)(InitialStartupModal);
