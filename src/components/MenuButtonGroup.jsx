import React, { Component } from 'react';
import { Row, Container, Col, Button, Form} from 'react-bootstrap';
import { getUserListAction } from '../actions/userList';
import './MenuButtonGroup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPowerOff, faSync, faEdit, faWindowMinimize, } from '@fortawesome/free-solid-svg-icons'
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import UserEditModal from '../containers/UserEditModalPanel';
import store from '../store/configureStore';
import $ from 'jquery';
import {disableSubmitButtonActionCreator} from '../actions/userEditModal';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize) //あらかじめ使用するアイコンを追加しておく

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class MenuButtonGroup extends Component {
  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  }

  reload = async () => {
    const { dispatch } = this.props;
    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();

    // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
    await dispatch(getUserListAction());
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop)
  }

  minimize = () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  }

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = store.getState().userList['userList'];
    const userID = electronStore.get('userID');
    const userInfo = this._getUserInfo(userList, userID);
    dispatch(disableSubmitButtonActionCreator());
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
    const isAuthenticated = store.getState().userList.isAuthenticated;

    return (
      <Row className='menu-button-group'>
        <Container>
            <Form.Row>
              <Form.Group as={Col} controlId='close'>
                <Button variant='light' className='w-100' onClick={this.close}>
                  <FontAwesomeIcon icon='power-off' /> 終了</Button>
              </Form.Group>
              <Form.Group as={Col} controlId='reload'>
                <Button variant='light' className='w-100' onClick={this.reload}>
                  <FontAwesomeIcon icon='sync' /> 再読込</Button>
              </Form.Group>
              <Form.Group as={Col} controlId='showUserEditModal'>
                <Button variant='light' className='w-100' onClick={this.showUserEditModal} disabled={userInfoLength === 0 || isAuthenticated === false}>
                  <FontAwesomeIcon icon='edit' /> 自分編集</Button>
              </Form.Group>
              <Form.Group as={Col} controlId='minimize'>
                <Button variant='light' className='w-100' onClick={this.minimize}>
                  <FontAwesomeIcon icon='window-minimize' /> 最小化</Button>
              </Form.Group>
            </Form.Row>
        </Container>
        <UserEditModal/>
      </Row>
    );
  }
}

export default MenuButtonGroup;
