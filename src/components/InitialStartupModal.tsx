import './InitialStartupModal.css';
import React from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { closeInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import store from '../store/configureStore';
import {
  addUserAction,
  getUserListAction,
  getChangeUserListAction,
  updateForAddedUserInfoAction,
  updateUserInfoAction,
  setUpdatedAtActionCreator,
  setMyUserIDActionCreator
} from '../actions/userList';
import { UserInfo } from '../define/model';
import MaterialButton from '@material/react-button';
import $ from 'jquery';
import { getUserInfo, sendHeartbeat } from './common/functions';
const { remote } = window.require('electron');

const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends React.Component<any, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  componentDidUpdate() {
    $('.nameForInput').focus();
  }

  constructor(props: any) {
    super(props);
    this.state = {
      submitButtonStatus: true,
      isChangeUser: false
    };
    this.userID = -1;
    this.userInfo['status'] = '在席';
    delete this.userInfo['id'];
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeInitialStartupModalActionCreator());
  };

  _addUser = async () => {
    const { dispatch } = this.props;

    // addUserAction で userListState の myUserID に新規ユーザIDが設定される
    await dispatch(addUserAction(this.userInfo));
    const userList = store.getState().userListState;
    if (userList.isError.status) {
      this.setState({ submitButtonStatus: false });
      return;
    }

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', userList.myUserID);

    // orderパラメータをidと同じ値に更新する
    const addedUserInfo: any = {};
    addedUserInfo['order'] = userList.myUserID;

    const session = remote.session.defaultSession as Electron.Session;
    const cookies: any = await session.cookies.get({
      name: 'version'
    });

    if (cookies[0]) {
      addedUserInfo['version'] = cookies[0].value;
    }

    await dispatch(updateForAddedUserInfoAction(addedUserInfo, userList.myUserID));
    dispatch(getUserListAction());

    sendHeartbeat(dispatch);

    this.closeModal();
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    electronStore.set('userID', this.userID);
    await dispatch(setMyUserIDActionCreator(this.userID));
    this.closeModal();

    await dispatch(getUserListAction());
    if (store.getState().userListState.isError.status === true) {
      return;
    }

    const myUserID = store.getState().userListState['myUserID'];
    const userList = store.getState().userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;

    const session = remote.session.defaultSession as Electron.Session;
    const cookies: any = await session.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      updatedUserInfo['version'] = cookies[0].value;
    }

    // 状態が「退社」のユーザのみ、状態を「在席」に変更する
    if (userInfo['status'] === '退社') {
      updatedUserInfo['status'] = '在席';
    }

    await dispatch(updateUserInfoAction(updatedUserInfo, myUserID));

    // 情報更新(updateUserInfoAction)の結果を元に、更新日時を更新する
    userInfo['updatedAt'] = store.getState().userListState.updatedAt;
    dispatch(setUpdatedAtActionCreator(JSON.parse(JSON.stringify(userList))));

    sendHeartbeat(dispatch);
  };

  onNameChange = (event: any) => {
    this.userInfo[event.currentTarget.name] = event.currentTarget.value;
    this.setState({ submitButtonStatus: event.currentTarget.value.length === 0 ? true : false });
  };

  onUserChange = (event: any) => {
    this.userID = parseInt(event.currentTarget.value);
    this.setState({ submitButtonStatus: false });
  };

  handleSubmit = (event: any) => {
    this.setState({ submitButtonStatus: true });
    event.preventDefault();

    if (this.state.isChangeUser) {
      this._changeUser();
    } else {
      this._addUser();
    }
  };

  changeUserInput = (event: any) => {
    const { dispatch } = this.props;
    this.setState({ submitButtonStatus: true });
    this.setState({ isChangeUser: true });
    dispatch(getChangeUserListAction());
  };

  registUserInput = (event: any) => {
    this.setState({ submitButtonStatus: true });
    this.setState({ isChangeUser: false });
  };

  render() {
    const onHide = store.getState().initialStartupModal.onHide;
    const isError = store.getState().userListState.isError.status;
    const changeUserList = store.getState().userListState['changeUserList'];

    return (
      <Modal
        dialogClassName='initialStartupModal'
        show={onHide}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        backdrop='static'
        animation={true}
        size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            ユーザ登録
            {isError && <span className='error-message'>通信に失敗しました。</span>}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Col md='2' />
                <Col md='8'>
                  <Form.Group controlId='name'>
                    <Form.Label>氏名</Form.Label>
                    {this.state.isChangeUser && (
                      <div>
                        <Form.Control name='name' as='select' onChange={this.onUserChange}>
                          <option hidden>選択してください</option>
                          {changeUserList
                            .sort((a: UserInfo, b: UserInfo) => {
                              return a.order - b.order;
                            })
                            .map((userInfo: UserInfo, index: number) => (
                              <option key={index} value={userInfo['id']}>
                                {userInfo['name']}
                              </option>
                            ))}
                        </Form.Control>
                        <Form.Text>
                          <span>新規登録は</span>
                          <Button variant='link' className='modal-button-user-delete userChange' onClick={this.registUserInput}>
                            こちら
                          </Button>
                        </Form.Text>
                      </div>
                    )}
                    {!this.state.isChangeUser && (
                      <div>
                        <Form.Control
                          className='nameForInput'
                          name='name'
                          placeholder='氏名を入力してください'
                          onChange={this.onNameChange}
                          maxLength={100}
                        />
                        <Form.Text>
                          <span>登録済みの場合は</span>
                          <Button variant='link' className='modal-button-user-delete userChange' onClick={this.changeUserInput}>
                            こちら
                          </Button>
                        </Form.Text>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md='2' />
              </Form.Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <MaterialButton
              outlined
              type='submit'
              className='modal-button button-submit'
              disabled={this.state.submitButtonStatus}>
              登録
            </MaterialButton>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default InitialStartupModal;
