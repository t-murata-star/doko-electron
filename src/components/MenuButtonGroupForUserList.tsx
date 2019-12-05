import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import $ from 'jquery';
import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { disableSubmitButtonActionCreator, showUserEditModalActionCreator } from '../actions/userEditModal';
import { getUserListAction } from '../actions/userList';
import UserEditModal from '../containers/UserEditModalPanel';
import store from '../store/configureStore';
import { getUserInfo } from './common/functions';
import './MenuButtonGroupForUserList.css';
library.add(faSync, faEdit); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForUserList extends React.Component<any, any> {
  reload = async () => {
    const { dispatch } = this.props;
    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
    // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
    await dispatch(getUserListAction(250));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const myUserID = store.getState().userListState['myUserID'];
    const userInfo = getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    dispatch(disableSubmitButtonActionCreator());
    dispatch(showUserEditModalActionCreator(myUserID, userInfo));
    // 自分編集ボタンのフォーカスを外す
    $('.menu-button-group-for-user-list-base-button').blur();
  };

  render() {
    const userList = store.getState().userListState;
    const myUserID = store.getState().userListState['myUserID'];
    const userInfo = getUserInfo(userList['userList'], myUserID);

    return (
      <Row className='menu-button-group-for-user-list'>
        <Container>
          <Form.Row>
            <Form.Group as={Col} controlId='reload'>
              <Button
                variant='outlined'
                color='default'
                onClick={this.reload}
                disabled={userList.isFetching === true}
                className='menu-button-group-for-user-list-base-button'
                style={{ boxShadow: 'none' }}>
                <FontAwesomeIcon icon='sync' />
                &nbsp;再読込
              </Button>
            </Form.Group>
            <Form.Group as={Col} controlId='showUserEditModal'>
              <Button
                variant='outlined'
                color='default'
                onClick={this.showUserEditModal}
                disabled={userInfo === null || userList.isAuthenticated === false}
                className='menu-button-group-for-user-list-base-button'
                style={{ boxShadow: 'none' }}>
                <FontAwesomeIcon icon='edit' />
                &nbsp;自分編集
              </Button>
            </Form.Group>
          </Form.Row>
        </Container>
        <UserEditModal />
      </Row>
    );
  }
}

export default MenuButtonGroupForUserList;
