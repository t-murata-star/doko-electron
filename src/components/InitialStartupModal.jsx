import './InitialStartupModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { closeInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import store from '../store/configureStore';
import {
  addUserAction,
  getUserListAction,
  getChangeUserListAction,
  updateForAddedUserInfoAction,
  sendHeartbeatAction,
  updateUserInfoAction,
  setUpdatedAtActionCreator
} from '../actions/userList';
import { USER_INFO } from '../define';
import MaterialButton from '@material/react-button';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitButtonStatus: true,
      isChangeUser: false
    };
    this.userID = null;
    this.userInfo = USER_INFO;
    this.userInfo['status'] = '在席';
    delete this.userInfo['id'];
  }

  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  };

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeInitialStartupModalActionCreator());
  };

  _addUser = async () => {
    const { dispatch } = this.props;
    await dispatch(addUserAction(this.userInfo));
    const userList = store.getState().userListState;
    if (userList.isError.status) {
      this.setState({ submitButtonStatus: false });
      return;
    }

    // orderパラメータをidと同じ値に更新する
    const userInfo = userList.userInfo;
    userInfo['order'] = userInfo['id'];

    const cookies = await remote.session.defaultSession.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      userInfo['version'] = cookies[0].value;
    }

    await dispatch(updateForAddedUserInfoAction(userInfo, userInfo['id']));
    dispatch(getUserListAction());
    this._heartbeat();

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', userInfo['id']);
    this.closeModal();
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    electronStore.set('userID', Number(this.userID));
    this.closeModal();
    await dispatch(getUserListAction());

    const userID = electronStore.get('userID');
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    const isError = store.getState().userListState.isError;

    if (isError.status === false && userInfoLength === 0) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;

    const cookies = await remote.session.defaultSession.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      updatedUserInfo['version'] = cookies[0].value;
    }

    // 状態が「退社」のユーザのみ、状態を「在席」に変更して情報を初期化
    if (userInfo['status'] === '退社') {
      updatedUserInfo['status'] = '在席';
      updatedUserInfo['destination'] = '';
      updatedUserInfo['return'] = '';
    }

    Object.assign(userInfo, updatedUserInfo);

    await dispatch(updateUserInfoAction(updatedUserInfo, userID));

    // 情報更新(updateUserInfoAction)の結果を元に、更新日時を更新する
    userInfo['updated_at'] = store.getState().userListState.updatedAt;
    dispatch(setUpdatedAtActionCreator(Object.assign([], userList)));

    this._heartbeat();
  };

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || {};
  };

  _heartbeat = () => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userListState['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;

    if (userInfoLength === 0) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['heartbeat'] = '';
    dispatch(sendHeartbeatAction(updatedUserInfo, userID));
  };

  onNameChange = event => {
    this.userInfo[event.target.name] = event.target.value;
    this.setState({ submitButtonStatus: event.target.value.length === 0 ? true : false });
  };

  onUserChange = event => {
    this.userID = event.target.value;
    this.setState({ submitButtonStatus: false });
  };

  handleSubmit = event => {
    this.setState({ submitButtonStatus: true });
    event.preventDefault();

    if (this.state.isChangeUser) {
      this._changeUser();
    } else {
      this._addUser();
    }
  };

  changeUserInput = event => {
    const { dispatch } = this.props;
    this.setState({ submitButtonStatus: true });
    this.setState({ isChangeUser: true });
    dispatch(getChangeUserListAction());
  };

  registUserInput = event => {
    this.setState({ submitButtonStatus: true });
    this.setState({ isChangeUser: false });
  };

  render() {
    const onHide = store.getState().initialStartupModal.onHide;
    const isError = store.getState().userListState.isError.status;
    const changeUserList = store.getState().userListState['changeUserList'];

    return (
      <Modal
        dialogClassName='initialStartupModal'
        show={onHide}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        backdrop='static'
        animation={true}
        size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            ユーザ登録
            {isError && <span className='error-message'>通信に失敗しました。</span>}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Col md='2' />
                <Col md='8'>
                  <Form.Group controlId='name'>
                    <Form.Label>氏名</Form.Label>
                    {this.state.isChangeUser && (
                      <div>
                        <Form.Control name='usesrID' as='select' onChange={this.onUserChange}>
                          <option hidden>選択してください</option>
                          {changeUserList
                            .sort((a, b) => {
                              return a.order - b.order;
                            })
                            .map((userInfo, index) => (
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
                    {!this.state.isChangeUser && (
                      <div>
                        <Form.Control
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
          </Modal.Body>
          <Modal.Footer>
            <MaterialButton
              outlined
              type='submit'
              className='modal-button button-submit'
              disabled={this.state.submitButtonStatus}>
              登録
            </MaterialButton>
            <MaterialButton outlined type='button' className='modal-button button-primary' onClick={this.close}>
              終了
            </MaterialButton>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default InitialStartupModal;
