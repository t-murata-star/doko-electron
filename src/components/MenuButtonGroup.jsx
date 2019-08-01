import React, { Component } from 'react';
import { Row, Container, Col, Button, ButtonToolbar} from 'react-bootstrap';
import { getUserListAction } from '../actions/userList';
import './MenuButtonGroup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPowerOff, faSync, faEdit, faWindowMinimize, } from '@fortawesome/free-solid-svg-icons'
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import UserEditModal from '../containers/UserEditModalPanel';
import store from '../store/configureStore';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize) //あらかじめ使用するアイコンを追加しておく

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

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
    const userList = store.getState().userList['userList'];
    const userID = electronStore.get('userID');
    const userInfo = this._getUserInfo(userList, userID);
    dispatch(showUserEditModalActionCreator(userID, userInfo));
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

  render() {
    const userList = store.getState().userList['userList'];
    const userID = electronStore.get('userID');
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    const statusCode = store.getState().userList.isError.code;

    return (
      <Row>
        <Container>
          <ButtonToolbar className='menu-button-group'>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.close}>
              <FontAwesomeIcon icon='power-off' /> 終了</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.reload} disabled={store.getState().userList.isFetching || statusCode === 404}>
              <FontAwesomeIcon icon='sync' /> 再読込</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.showModal} disabled={userInfoLength === 0}>
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
