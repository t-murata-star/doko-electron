import React, { Component } from 'react';
import { Row, Container, Col, Button, ButtonToolbar} from 'react-bootstrap';
import { getUserListAction } from '../actions/userList';
import store from '../store/configureStore';
import './MenuButtonGroup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPowerOff, faSync, faEdit, faWindowMinimize, } from '@fortawesome/free-solid-svg-icons'
import { showModalActionCreator } from '../actions/userEdit';
import UserEditModal from '../containers/UserEditModal';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize) //あらかじめ使用するアイコンを追加しておく

const { remote } = window.require('electron');

class MenuButtonGroup extends Component {
  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  }

  reload = () => {
    const { dispatch } = this.props;
    dispatch(getUserListAction());
  }

  minimize = () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  }

  showModal = () => {
    const { dispatch } = this.props;
    dispatch(showModalActionCreator());
  }

  render() {

    return (
      <Row>
        <Container>
          <ButtonToolbar className='menu-button-group'>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.close}>
              <FontAwesomeIcon icon='power-off' /> 終了</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.reload}>
              <FontAwesomeIcon icon='sync' /> 再読込</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.showModal}>
              <FontAwesomeIcon icon='edit' /> 自分編集</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.minimize}>
              <FontAwesomeIcon icon='window-minimize' /> 最小化</Button></Col>
          </ButtonToolbar>
        </Container>
        <UserEditModal/>
      </Row>
    );
  }
}

export default MenuButtonGroup;
