import './EmployeeInfoButton.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button, ButtonToolbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class EmployeeInfoButton extends Component {
  render() {
    return (
      <Main />
    )
  }
}

function Main() {
  const [modalShow, setModalShow] = React.useState(false);
  return (
    <ButtonToolbar>
      <Button variant='light' className='w-100' onClick={() => setModalShow(true)}>
        <FontAwesomeIcon icon='edit' /> 自分編集
      </Button>
      <EmployeeInfoModal show={modalShow} onHide={() => setModalShow(false)} />
    </ButtonToolbar>
  );
}

function EmployeeInfoModal(props) {
  return (
    <Modal {...props} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          情報変更
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>

          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="employeeName">
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
        <Button variant='primary' className='modal-button' onClick={props.onHide}>更新</Button>
        <Button variant='light' className='modal-button' onClick={props.onHide}>キャンセル</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmployeeInfoButton;
