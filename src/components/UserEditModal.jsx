/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEdit.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { closeModalAction } from '../actions/userEdit';
import store from '../store/configureStore';

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class UserEditModal extends Component {
  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeModalAction());
  }

  render() {
    const userEdit = store.getState().userEdit.onHide;
    return (
      <Modal show={userEdit} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>

            <Form>
              <Form.Row>
                <Form.Group as={Col} controlId="userName">
                  <Form.Label>氏名</Form.Label>
                  <Form.Control placeholder="" />
                </Form.Group>

                <Form.Group as={Col} controlId="status">
                  <Form.Label>状態</Form.Label>
                  <Form.Control placeholder="" />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group as={Col} controlId="destination">
                  <Form.Label>行き先</Form.Label>
                  <Form.Control placeholder="" />
                </Form.Group>

                <Form.Group as={Col} controlId="return">
                  <Form.Label>戻り</Form.Label>
                  <Form.Control placeholder="" />
                </Form.Group>
              </Form.Row>

              <Form.Group controlId="message">
                <Form.Label>メッセージ</Form.Label>
                <Form.Control placeholder="" />
              </Form.Group>
            </Form>

          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' className='modal-button' onClick={this.closeModal}>更新</Button>
          <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default UserEditModal;
