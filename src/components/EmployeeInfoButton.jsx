import './EmployeeInfoButton.css';
import React, { Component } from 'react';
import { Row, Container, Col, Modal, Button, ButtonToolbar } from 'react-bootstrap';
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
          <Row className='show-grid'>
            <Col xs={12} md={8}>
              <code>.col-xs-12 .col-md-8</code>
            </Col>
            <Col xs={6} md={4}>
              <code>.col-xs-6 .col-md-4</code>
            </Col>
          </Row>

          <Row className='show-grid'>
            <Col xs={6} md={4}>
              <code>.col-xs-6 .col-md-4</code>
            </Col>
            <Col xs={6} md={4}>
              <code>.col-xs-6 .col-md-4</code>
            </Col>
            <Col xs={6} md={4}>
              <code>.col-xs-6 .col-md-4</code>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmployeeInfoButton;
