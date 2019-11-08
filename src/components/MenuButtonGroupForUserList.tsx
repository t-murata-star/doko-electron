import React from 'react';
import { Row, Container, Col, Form } from 'react-bootstrap';
import { getUserListAction } from '../actions/userList';
import './MenuButtonGroupForUserList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSync, faEdit } from '@fortawesome/free-solid-svg-icons';
import { showUserEditModalActionCreator, disableSubmitButtonActionCreator } from '../actions/userEditModal';
import UserEditModal from '../containers/UserEditModalPanel';
import store from '../store/configureStore';
import $ from 'jquery';
import MaterialButton from '@material/react-button';
import { UserInfo } from '../define/model';
const { remote } = window.require('electron');
library.add(faSync, faEdit); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForUserList extends React.Component<any, any> {
  reload = async () => {
    // const { dispatch } = this.props;
    // const tabulatorScrollTop = $('.tabulator-tableHolder').scrollTop();

    // // ユーザ一覧取得前のスクロール位置を保持し、取得後にスクロール位置を復元する
    // await dispatch(getUserListAction());
    // $('.tabulator-tableHolder').scrollTop(tabulatorScrollTop || 0);

    const mailAddress = '';
    const encodedMailAddress = encodeURI(mailAddress);

    let win: any = new remote.BrowserWindow({
      width: 1120,
      height: 700,
      resizable: false,
      fullscreen: false,
      fullscreenable: false,
      maximizable: false,
      webPreferences: {
        devTools: false,
        nodeIntegration: true
      },
      parent: remote.getCurrentWindow(),
      modal: true
    });
    win.setMenuBarVisibility(false);

    win.on('closed', () => {
      win = null;
    });
    win.loadURL(
      `https://calendar.google.com/calendar/embed?src=${encodedMailAddress}&ctz=Asia%2FTokyo&mode=WEEK&showTitle=0&showTz=0&showPrint=0`
    );
    win.show();
  };

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const myUserID = store.getState().userListState['myUserID'];
    const userInfo = this._getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    dispatch(disableSubmitButtonActionCreator());
    dispatch(showUserEditModalActionCreator(myUserID, userInfo));
  };

  _getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
    if (!userList) {
      return null;
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || null;
  };

  render() {
    const userList = store.getState().userListState;
    const myUserID = store.getState().userListState['myUserID'];
    const userInfo = this._getUserInfo(userList['userList'], myUserID);

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
                disabled={userInfo === null || userList.isAuthenticated === false}>
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
