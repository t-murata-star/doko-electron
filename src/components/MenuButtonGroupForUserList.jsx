import React, { Component } from 'react';
import { Row, Container, Col, Form } from 'react-bootstrap';
import { getUserListAction } from '../actions/userList';
import './MenuButtonGroupForUserList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSync, faEdit } from '@fortawesome/free-solid-svg-icons';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import UserEditModal from '../containers/UserEditModalPanel';
import store from '../store/configureStore';
import $ from 'jquery';
import { disableSubmitButtonActionCreator } from '../actions/userEditModal';
import MaterialButton from '@material/react-button';

library.add(faSync, faEdit); //あらかじめ使用するアイコンを追加しておく

const Store = window.require('electron-store');
const electronStore = new Store();

class MenuButtonGroupForUserList extends Component {
  reload = async () => {
    const { dispatch } = this.props;
    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();

    // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
    await dispatch(getUserListAction());
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop);
  };

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const userID = electronStore.get('userID');
    const userInfo = this._getUserInfo(userList, userID);
    dispatch(disableSubmitButtonActionCreator());
    dispatch(showUserEditModalActionCreator(userID, userInfo));
  };

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || {};
  };

  render() {
    const userList = store.getState().userListState;
    const userID = electronStore.get('userID');
    const userInfo = this._getUserInfo(userList['userList'], userID);
    const userInfoLength = Object.keys(userInfo).length;

    return (
      <Row className='menu-button-group-for-user-list'>
        <Container>
          <Form.Row>
            <Form.Group as={Col} controlId='reload'>
              <MaterialButton
                outlined
                type='button'
                className='w-100 button-primary'
                onClick={this.reload}
                disabled={userList.isFetching === true}>
                <FontAwesomeIcon icon='sync' /> 再読込
              </MaterialButton>
            </Form.Group>
            <Form.Group as={Col} controlId='showUserEditModal'>
              <MaterialButton
                outlined
                type='button'
                className='w-100 button-primary'
                onClick={this.showUserEditModal}
                disabled={userInfoLength === 0 || userList.isAuthenticated === false}>
                <FontAwesomeIcon icon='edit' /> 自分編集
              </MaterialButton>
            </Form.Group>
          </Form.Row>
        </Container>
        <UserEditModal />
      </Row>
    );
  }
}

export default MenuButtonGroupForUserList;
