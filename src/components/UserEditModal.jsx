/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEditModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import {
  closeUserEditModalActionCreator,
  enableSubmitButtonActionCreator,
  disableSubmitButtonActionCreator,
  handleChangeUserActionCreator,
  handleEditUserActionCreator
} from '../actions/userEditModal';
import store from '../store/configureStore';
import { updateUserInfoAction, getUserListAction, deleteUserAction } from '../actions/userList';
import { USER_INFO, STATUS_LIST } from '../define';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class UserEditModal extends Component {
  constructor(props) {
    super(props)
    this.userInfo = USER_INFO;
    this.userID = null;
  }

  componentDidUpdate() {
    const userInfo = store.getState().userEditModal.userInfo;
    this.userInfo = Object.assign({}, userInfo);
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeUserEditModalActionCreator());
  }

  _updateUserInfo = (userInfo) => {
    const { dispatch } = this.props;
    const userID = store.getState().userEditModal.userID;
    dispatch(updateUserInfoAction(userInfo, userID))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            dispatch(enableSubmitButtonActionCreator(userInfo));
            return;
          }
          this.closeModal();
          dispatch(getUserListAction());
        }
      );
  }

  _changeUser = () => {
    const { dispatch } = this.props;
    electronStore.set('userID', Number(this.userID));
    this.closeModal();
    dispatch(getUserListAction());
  }

  onInfoChange = (event) => {
    const { dispatch } = this.props;
    this.userInfo[event.target.name] = event.target.value;
    if (store.getState().userEditModal.submitButtonStatus) {
      dispatch(enableSubmitButtonActionCreator(this.userInfo));
    }
  }

  onUserChange = (event) => {
    const { dispatch } = this.props;
    this.userID = event.target.value;
    if (store.getState().userEditModal.submitButtonStatus) {
      dispatch(enableSubmitButtonActionCreator(this.userInfo));
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(disableSubmitButtonActionCreator());

    if (store.getState().userEditModal.isChangeUser) {
      this._changeUser();
    } else {
      this._updateUserInfo(this.userInfo);
    }
  }

  handleChangeUser = (event) => {
    const { dispatch } = this.props;
    dispatch(handleChangeUserActionCreator());
    dispatch(getUserListAction());
  }

  handleEditUser = (event) => {
    const { dispatch } = this.props;
    dispatch(handleEditUserActionCreator());
  }

  deleteUser = (event) => {
    const { dispatch } = this.props;
    let userInfo = store.getState().userEditModal.userInfo;
    const index = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: '以下のユーザを一覧から削除しますか？\n\n' + this.userInfo['name'],
    });

    if (index !== 0) {
      return;
    }
    dispatch(deleteUserAction(userInfo['id']))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            return;
          }
          this.closeModal();
          dispatch(getUserListAction());
        }
      );
  }

  render() {
    const userEditModal = store.getState().userEditModal;
    const userList = store.getState().userList;
    userEditModal.userInfo = userEditModal.userInfo ? userEditModal.userInfo : USER_INFO;
    let userInfo = store.getState().userEditModal.userInfo;
    userInfo = userInfo ? userInfo : USER_INFO;

    return (
      <Modal dialogClassName='userEditModal' show={userEditModal.onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
            {userList.isError.status &&
              <span className='error-message'>通信に失敗しました。</span>
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              {!userEditModal.isChangeUser &&
                <div>
                  <Form.Row>
                    <Form.Group as={Col} controlId='name'>
                      <Form.Label><span className='name'>氏名</span></Form.Label>
                      {userInfo['id'] === electronStore.get('userID') &&
                        <a href='/#' className='userChange' onClick={this.handleChangeUser}>ユーザ変更</a>
                      }
                      <Form.Control name="name" placeholder="" defaultValue={userInfo.name} onChange={this.onInfoChange} maxLength={100} />
                    </Form.Group>
                    <Form.Group as={Col} controlId='status'>
                      <Form.Label>状態</Form.Label>
                      <Form.Control name="status" as='select' defaultValue={STATUS_LIST.includes(userInfo.status) ? userInfo.status : '？？？'} onChange={this.onInfoChange}>
                        {STATUS_LIST.map((status, index) => (
                          <option key={index}>{status}</option>
                        ))}
                        <option hidden>？？？</option>
                      </Form.Control>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} controlId='destination'>
                      <Form.Label>行き先</Form.Label>
                      <Form.Control name="destination" placeholder="" defaultValue={userInfo.destination} onChange={this.onInfoChange} maxLength={100} />
                    </Form.Group>
                    <Form.Group as={Col} controlId='return'>
                      <Form.Label>戻り</Form.Label>
                      <Form.Control name="return" placeholder="" defaultValue={userInfo.return} onChange={this.onInfoChange} maxLength={100} />
                    </Form.Group>
                  </Form.Row>
                  <Form.Group controlId='message'>
                    <Form.Label>メッセージ</Form.Label>
                    <Form.Control name="message" placeholder="" defaultValue={userInfo.message} onChange={this.onInfoChange} maxLength={100} />
                  </Form.Group>
                </div>
              }

              {userEditModal.isChangeUser &&
                <div>
                  <Form.Row>
                    <Col md="2" />
                    <Col md="8">
                      <Form.Group as={Col} controlId='name'>
                        <Form.Label><span className='name'>氏名</span></Form.Label> <a href='/#' className='userChange' onClick={this.handleEditUser}>戻る</a>
                        <Form.Control name="usesrID" as='select' onChange={this.onUserChange}>
                          <option hidden>選択してください</option>
                          {userList.userList.map((userInfo, index) => (
                            <option key={index} value={userInfo['id']}>{userInfo['name']}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="2" />
                  </Form.Row>
                </div>
              }
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {!userEditModal.isChangeUser &&
              <Button variant='outline-light' className='modal-button-user-delete' onClick={this.deleteUser}>削除</Button>
            }
            <Button type="submit" variant='primary' className='modal-button' disabled={store.getState().userEditModal.submitButtonStatus}>更新</Button>
            <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default UserEditModal;
