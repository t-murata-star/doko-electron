/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEditModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { closeModalActionCreator } from '../actions/userEdit';
import store from '../store/configureStore';
import { updateUserInfoAction } from '../actions/userList';
import { USER_INFO } from '../define';

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class UserEditModal extends Component {
  componentDidUpdate() {
    this.userInfo = Object.assign({}, this.props.userInfo);
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeModalActionCreator());
  }

  _updateUserInfo = (userInfo) => {
    const { dispatch } = this.props;
    const id = 1;
    dispatch(updateUserInfoAction(userInfo, id))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            return;
          }
          this.closeModal();
        }
    );
  }

  handleChange = (event) => {
    this.userInfo[event.target.name] = event.target.value;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this._updateUserInfo(this.userInfo);
  }

  render() {
    const onHide = store.getState().userEdit.onHide;
    const userInfo = this.props.userInfo;
    const userList = store.getState().userList;

    return (
      <Modal show={onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
            {userList.isError.status &&
              <span className='error-message'>通信に失敗しました。</span>
            }
        </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>氏名</Form.Label>
                  <Form.Control name="name" placeholder="" defaultValue={userInfo.name} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>状態</Form.Label>
                  <Form.Control name="status" placeholder="" defaultValue={userInfo.status} onChange={this.handleChange} />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>行き先</Form.Label>
                  <Form.Control name="destination" placeholder="" defaultValue={userInfo.destination} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>戻り</Form.Label>
                  <Form.Control name="return" placeholder="" defaultValue={userInfo.return} onChange={this.handleChange} />
                </Form.Group>
              </Form.Row>
              <Form.Group>
                <Form.Label>メッセージ</Form.Label>
                <Form.Control name="message" placeholder="" defaultValue={userInfo.message} onChange={this.handleChange} />
              </Form.Group>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant='primary' className='modal-button'>更新</Button>
            <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

UserEditModal.defaultProps = {
  userInfo: USER_INFO
}

export default UserEditModal;
