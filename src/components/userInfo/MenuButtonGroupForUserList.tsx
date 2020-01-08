import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import $ from 'jquery';
import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { disableSubmitButtonActionCreator, showUserEditModalActionCreator } from '../../actions/userInfo/userEditModal';
import { getUserListAction } from '../../actions/userInfo/userList';
import UserEditModal from '../../containers/userInfo/UserEditModalPanel';
import { getUserInfo } from '../common/functions';
import './MenuButtonGroupForUserList.css';
library.add(faSync, faEdit); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForUserList extends React.Component<any, any> {
  reload = async () => {
    const { dispatch } = this.props;
    const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();
    // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
    const myUserID = this.props.state.appState.myUserID;
    await dispatch(getUserListAction(myUserID, 250));
    $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);
  };

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = this.props.state.userListState['userList'];
    const myUserID = this.props.state.appState['myUserID'];
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
    const userList = this.props.state.userListState;
    const appState = this.props.state.appState;
    const myUserID = appState['myUserID'];
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
                disabled={userInfo === null || appState.isAuthenticated === false}
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
