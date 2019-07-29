import './InitialStartupModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { closeInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import store from '../store/configureStore';
import { addUserAction, getUserListAction, updateUserInfoAction } from '../actions/userList';
import { USER_INFO } from '../define';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends Component {
  constructor(props) {
    super(props)
    this.state = { submitButtonStatus: true }
    this.userInfo = USER_INFO;
    this.userInfo['status'] = '在席';
    delete this.userInfo['id'];
  }

  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeInitialStartupModalActionCreator());
  }

  _addUser = () => {
    const { dispatch } = this.props;
    dispatch(addUserAction(this.userInfo))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            this.setState({ submitButtonStatus: false });
            return;
          }

          // orderパラメータをidと同じ値に更新する
          const userInfo = userList.userInfo;
          userInfo['order'] = userInfo['id'];
          dispatch(updateUserInfoAction(userInfo, userInfo['id']))
            .then(
              () => dispatch(getUserListAction())
            );

          // userIDを設定ファイルに登録（既に存在する場合は上書き）
          electronStore.set('userID', userList.userInfo['id']);
          this.closeModal();
        }
      );
  }

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList
      .filter(userInfo => {
        return userInfo['id'] === userID;
      })[0];
    return userInfo || {};
  }

  handleChange = (event) => {
    this.userInfo[event.target.name] = event.target.value;
    this.setState({ submitButtonStatus: event.target.value.length === 0 ? true : false })
  }

  handleSubmit = (event) => {
    this.setState({ submitButtonStatus: true });
    event.preventDefault();
    this._addUser();
  }

  render() {
    const onHide = store.getState().initialStartupModal.onHide;
    const isError = store.getState().userList.isError.status;

    return (
      <Modal dialogClassName='initialStartupModal' show={onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            ユーザ登録
            {isError &&
              <span className='error-message'>通信に失敗しました。</span>
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Col md="2" />
                <Col md="8">
                  <Form.Group controlId='name'>
                    <Form.Label>氏名</Form.Label>
                    <Form.Control name="name" placeholder="" onChange={this.handleChange} maxLength={100} />
                    <Form.Text>
                      氏名を入力してください。
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md="2" />
              </Form.Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant='primary' className='modal-button' disabled={this.state.submitButtonStatus}>登録</Button>
            <Button variant='light' className='modal-button' onClick={this.close}>終了</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default InitialStartupModal;
