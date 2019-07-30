/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEditModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import {
  closeUserEditModalActionCreator,
  enableSubmitButtonActionCreator,
  disableSubmitButtonActionCreator
} from '../actions/userEditModal';
import store from '../store/configureStore';
import { updateUserInfoAction, getUserListAction } from '../actions/userList';
import { USER_INFO, STATUS_LIST } from '../define';


class UserEditModal extends Component {
  constructor(props) {
    super(props)
    this.userInfo = USER_INFO;
  }

  componentDidUpdate() {
    const userInfo = store.getState().userEditModal.userInfo;
    this.userInfo = Object.assign({}, userInfo);
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeUserEditModalActionCreator());
  }

  _updateUserInfo = (userInfo) => {
    const { dispatch } = this.props;
    const userID = store.getState().userEditModal.userID;
    dispatch(updateUserInfoAction(userInfo, userID))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            dispatch(enableSubmitButtonActionCreator(userInfo));
            return;
          }
          this.closeModal();
          dispatch(getUserListAction());
        }
      );
  }

  handleChange = (event) => {
    const { dispatch } = this.props;
    this.userInfo[event.target.name] = event.target.value;
    dispatch(enableSubmitButtonActionCreator(this.userInfo));
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(disableSubmitButtonActionCreator());
    this._updateUserInfo(this.userInfo);
  }

  render() {
    let userInfo = store.getState().userEditModal.userInfo;
    userInfo = userInfo ? userInfo : USER_INFO;
    const onHide = store.getState().userEditModal.onHide;
    const isError = store.getState().userList.isError.status;

    return (
      <Modal dialogClassName='userEditModal' show={onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
            {isError &&
              <span className='error-message'>通信に失敗しました。</span>
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Form.Group as={Col} controlId='name'>
                  <Form.Label>氏名</Form.Label>
                  <Form.Control name="name" placeholder="" defaultValue={userInfo.name} onChange={this.handleChange} maxLength={100} />
                </Form.Group>
                <Form.Group as={Col} controlId='status'>
                  <Form.Label>状態</Form.Label>
                  <Form.Control name="status" as='select' defaultValue={STATUS_LIST.includes(userInfo.status) ? userInfo.status : '？？？'} onChange={this.handleChange}>
                    {STATUS_LIST.map((status, index) => (
                      <option key={index}>{status}</option>
                    ))}
                    <option hidden>？？？</option>
                  </Form.Control>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} controlId='destination'>
                  <Form.Label>行き先</Form.Label>
                  <Form.Control name="destination" placeholder="" defaultValue={userInfo.destination} onChange={this.handleChange} maxLength={100} />
                </Form.Group>
                <Form.Group as={Col} controlId='return'>
                  <Form.Label>戻り</Form.Label>
                  <Form.Control name="return" placeholder="" defaultValue={userInfo.return} onChange={this.handleChange} maxLength={100} />
                </Form.Group>
              </Form.Row>
              <Form.Group controlId='message'>
                <Form.Label>メッセージ</Form.Label>
                <Form.Control name="message" placeholder="" defaultValue={userInfo.message} onChange={this.handleChange} maxLength={100} />
              </Form.Group>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant='primary' className='modal-button' disabled={store.getState().userEditModal.submitButtonStatus}>更新</Button>
            <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default UserEditModal;
