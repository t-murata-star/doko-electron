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
import { closeModalAction } from '../actions/userEdit';
import store from '../store/configureStore';
import { updateUserInfo } from '../actions/userList';

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class UserEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeModalAction());
  }

  edit_myself = () => {
    const { dispatch } = this.props;
    const id = 1;
    const userInfo = this.props.userInfo;
    dispatch(updateUserInfo(userInfo, id));
  }

  handleFormSubmit(event) {
    event.preventDefault();
    const target = event.target;

    // form値取得
    const params = target.userName.value;

    alert(params);
  }

  render() {
    const onHide = store.getState().userEdit.onHide;
    const userInfo = this.props.userInfo;

    return (
      <Modal show={onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
        </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleFormSubmit}>
        <Modal.Body>
          <Container>
              <Form.Row>
                <Form.Group as={Col} controlId="userName">
                  <Form.Label>氏名</Form.Label>
                  <Form.Control placeholder="" defaultValue={userInfo.name} />
                </Form.Group>

                <Form.Group as={Col} controlId="status">
                  <Form.Label>状態</Form.Label>
                  <Form.Control placeholder="" defaultValue={userInfo.status} />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group as={Col} controlId="destination">
                  <Form.Label>行き先</Form.Label>
                  <Form.Control placeholder="" defaultValue={userInfo.destination} />
                </Form.Group>

                <Form.Group as={Col} controlId="return">
                  <Form.Label>戻り</Form.Label>
                  <Form.Control placeholder="" defaultValue={userInfo.return} />
                </Form.Group>
              </Form.Row>

              <Form.Group controlId="message">
                <Form.Label>メッセージ</Form.Label>
                <Form.Control placeholder="" defaultValue={userInfo.message} />
              </Form.Group>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button  type="submit" variant='primary' className='modal-button'>更新</Button>
          <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
        </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

UserEditModal.defaultProps = {
  userInfo: {
    name: '',
    status: '',
    destination: '',
    return: ''
  }
}

export default UserEditModal;
