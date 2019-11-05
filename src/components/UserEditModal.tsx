/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEditModal.css';
import React from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import {
  closeUserEditModalActionCreator,
  enableSubmitButtonActionCreator,
  disableSubmitButtonActionCreator,
  handleChangeUserActionCreator,
  handleEditUserActionCreator,
  inputClearActionCreator,
  changeUserInfoActionCreator
} from '../actions/userEditModal';
import store from '../store/configureStore';
import { updateUserInfoAction, getUserListAction, deleteUserAction, setMyUserIDActionCreator } from '../actions/userList';
import { STATUS_LIST } from '../define';
import MaterialButton from '@material/react-button';
import ReactTooltip from 'react-tooltip';
import { UserInfo } from '../define/model';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class UserEditModal extends React.Component<any, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  constructor(props: any) {
    super(props);
    this.state = {
      isError: false
    };
  }

  componentDidUpdate() {
    this.userInfo = Object.assign({}, this.props.userInfo);
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeUserEditModalActionCreator());
  };

  _updateUserInfo = async (userInfo: UserInfo) => {
    const { dispatch } = this.props;
    const userID = this.props.userID;

    await dispatch(updateUserInfoAction(userInfo, userID));
    const userList = store.getState().userListState;
    if (userList.isError.status) {
      dispatch(enableSubmitButtonActionCreator());
      return;
    }
    this.closeModal();
    dispatch(getUserListAction());
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    electronStore.set('userID', this.userID);
    await dispatch(setMyUserIDActionCreator(this.userID));
    this.closeModal();
    dispatch(getUserListAction());
  };

  onUserInfoChange = (event: any) => {
    const { dispatch } = this.props;
    dispatch(changeUserInfoActionCreator(this.userInfo, event.target.name, event.target.value));
    if (this.props.submitButtonStatus) {
      dispatch(enableSubmitButtonActionCreator());
    }
  };

  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    this.userID = parseInt(event.target.value);
    if (this.props.submitButtonStatus) {
      dispatch(enableSubmitButtonActionCreator());
    }
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(disableSubmitButtonActionCreator());

    if (this.props.isChangeUser) {
      this._changeUser();
    } else {
      this._updateUserInfo(this.userInfo);
    }
  };

  handleChangeUser = (event: any) => {
    const { dispatch } = this.props;
    dispatch(handleChangeUserActionCreator());
  };

  handleEditUser = (event: any) => {
    const { dispatch } = this.props;
    dispatch(handleEditUserActionCreator());
  };

  deleteUser = (event: any) => {
    const { dispatch } = this.props;
    const index = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: '以下のユーザを一覧から削除しますか？\n\n' + this.userInfo['name']
    });

    if (index !== 0) {
      return;
    }
    dispatch(deleteUserAction(this.props.userInfo['id'])).then(() => {
      const userList = store.getState().userListState;
      if (userList.isError.status) {
        this.setState({ isError: true });
        return;
      }
      this.closeModal();
      dispatch(getUserListAction());
    });
  };

  inputClear = () => {
    const { dispatch } = this.props;
    dispatch(inputClearActionCreator(this.userInfo));
    dispatch(enableSubmitButtonActionCreator());
  };

  render() {
    const userList = store.getState().userListState;
    const userInfo = this.props.userInfo;
    const myUserID = store.getState().userListState['myUserID'];

    return (
      <Modal
        dialogClassName='userEditModal'
        show={this.props.onHide}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        backdrop='static'
        animation={true}
        size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
            {userList.isError.status && <span className='error-message'>通信に失敗しました。</span>}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              {!this.props.isChangeUser && (
                <div>
                  <Form.Row>
                    <Form.Group as={Col} controlId='name'>
                      <Form.Label>
                        <span className='name'>氏名</span>
                      </Form.Label>
                      {userInfo['id'] === myUserID && (
                        <Button variant='link' className='userChange' onClick={this.handleChangeUser}>
                          ユーザ変更
                        </Button>
                      )}
                      <Form.Control
                        name='name'
                        placeholder=''
                        value={userInfo.name}
                        onChange={this.onUserInfoChange}
                        maxLength={100}
                      />
                    </Form.Group>
                    <Form.Group as={Col} controlId='status'>
                      <Form.Label>
                        <span className='status'>状態</span>
                      </Form.Label>
                      <span data-tip='状態を在席に変更し、行き先と戻りを削除します'>
                        <MaterialButton
                          outlined
                          type='button'
                          className='modal-button-clear button-primary '
                          onClick={this.inputClear}>
                          在席
                        </MaterialButton>
                        <ReactTooltip effect='solid' place='top' />
                      </span>
                      <Form.Control name='status' as='select' value={userInfo.status} onChange={this.onUserInfoChange}>
                        {STATUS_LIST.map((status: string, index: number) => (
                          <option key={index}>{status}</option>
                        ))}
                        <option hidden>{userInfo.status}</option>
                      </Form.Control>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} controlId='destination'>
                      <Form.Label>行き先</Form.Label>
                      <Form.Control
                        name='destination'
                        placeholder=''
                        value={userInfo.destination}
                        onChange={this.onUserInfoChange}
                        maxLength={100}
                      />
                    </Form.Group>
                    <Form.Group as={Col} controlId='return'>
                      <Form.Label>戻り</Form.Label>
                      <Form.Control
                        name='return'
                        placeholder=''
                        value={userInfo.return}
                        onChange={this.onUserInfoChange}
                        maxLength={100}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Group controlId='message'>
                    <Form.Label>メッセージ</Form.Label>
                    <Form.Control
                      name='message'
                      placeholder=''
                      value={userInfo.message}
                      onChange={this.onUserInfoChange}
                      maxLength={100}
                    />
                  </Form.Group>
                </div>
              )}

              {this.props.isChangeUser && (
                <div>
                  <Form.Row>
                    <Col md='2' />
                    <Col md='8'>
                      <Form.Group as={Col} controlId='name'>
                        <Form.Label>
                          <span className='name'>氏名</span>
                        </Form.Label>
                        <Button variant='link' className='modal-button-user-delete userChange' onClick={this.handleEditUser}>
                          戻る
                        </Button>
                        <Form.Control name='usesrID' as='select' onChange={this.onUserChange}>
                          <option hidden>選択してください</option>
                          {userList.userList
                            .sort((a: UserInfo, b: UserInfo) => {
                              return a.order - b.order;
                            })
                            .map((userInfo: UserInfo, index: number) => (
                              <option key={index} value={userInfo['id']}>
                                {userInfo['name']}
                              </option>
                            ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md='2' />
                  </Form.Row>
                </div>
              )}
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {!this.props.isChangeUser && (
              <MaterialButton outlined type='button' className='button-user-delete' onClick={this.deleteUser}>
                削除
              </MaterialButton>
            )}
            <MaterialButton
              outlined
              type='submit'
              className='modal-button button-submit'
              disabled={this.props.submitButtonStatus}>
              登録
            </MaterialButton>
            <MaterialButton outlined type='button' className='modal-button button-primary' onClick={this.closeModal}>
              キャンセル
            </MaterialButton>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default UserEditModal;