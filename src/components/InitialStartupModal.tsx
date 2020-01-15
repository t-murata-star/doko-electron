import MaterialUiButton from '@material-ui/core/Button';
import $ from 'jquery';
import React, { useEffect, Props } from 'react';
import { Button, Col, Container, Form, Modal } from 'react-bootstrap';
import { setMyUserIDActionCreator } from '../actions/app';
import {
  addUserAction,
  getUserListAction,
  updateForAddedUserInfoAction,
  updateStateUserListActionCreator,
  updateUserInfoAction
} from '../actions/userInfo/userList';
import { UserInfo } from '../define/model';
import { getUserInfo, sendHeartbeat } from './common/functions';
import './InitialStartupModal.css';
import { useDispatch } from 'react-redux';
import { initialStartupModal } from '../modules/initialStartupModalModule';
import { APP_VERSION } from '../define';
import { useSelector } from "react-redux";
import { RootState } from '../reducers';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class InitialStartupModal extends React.Component<any, any> {
  userID: number = -1;
  userInfo: any = new UserInfo();

  componentDidUpdate() {
    $('.nameForInput').focus();
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(initialStartupModal.actions.showModal(false));
  };

  _addUser = async () => {
    const { dispatch } = this.props;

    const session = remote.session.defaultSession as Electron.Session;
    const cookies: any = await session.cookies.get({
      name: 'version'
    });
    if (cookies[0]) {
      this.userInfo['version'] = cookies[0].value;
    }
    this.userInfo['status'] = '在席';

    // addUserAction で userListState の myUserID に新規ユーザIDが設定される
    await dispatch(addUserAction(this.userInfo));
    const userList = this.props.state.userListState;
    if (userList.isError.status) {
      dispatch(initialStartupModal.actions.disableSubmitButton(false));
      return;
    }

    const myUserID = this.props.state.userListState.addedUserInfo.id;
    dispatch(setMyUserIDActionCreator(myUserID));

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', myUserID);

    // orderパラメータをidと同じ値に更新する
    const addedUserInfo: any = {};
    addedUserInfo['order'] = myUserID;

    await dispatch(updateForAddedUserInfoAction(addedUserInfo, myUserID));
    dispatch(getUserListAction(myUserID));

    sendHeartbeat(dispatch);

    this.closeModal();
  };

  _changeUser = async () => {
    const { dispatch } = this.props;
    const myUserID = this.userID;
    const userList = this.props.state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    electronStore.set('userID', myUserID);
    dispatch(setMyUserIDActionCreator(myUserID));

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
    if (this.props.state.userListState.isError.status === true) {
      return;
    }

    dispatch(updateStateUserListActionCreator(userList));
    this.closeModal();

    dispatch(getUserListAction(myUserID, 250));
    sendHeartbeat(dispatch);
  };

  onNameChange = (event: any) => {
    const { dispatch } = this.props;
    this.userInfo[event.currentTarget.name] = event.currentTarget.value;
    dispatch(initialStartupModal.actions.disableSubmitButton(event.currentTarget.value.length === 0 ? true : false));
  };

  onUserChange = (event: any) => {
    const { dispatch } = this.props;
    this.userID = parseInt(event.currentTarget.value);
    dispatch(initialStartupModal.actions.disableSubmitButton(false));
  };

  handleSubmit = (event: any) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    event.preventDefault();

    if (this.props.state.initialStartupModalState.isChangeUser) {
      this._changeUser();
    } else {
      this._addUser();
    }
  };

  changeUserInput = (event: any) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    dispatch(initialStartupModal.actions.changeSubmitMode(true));
    // ユーザ一覧は表示されていないため退社チェックは実行されなくても問題ない
    dispatch(getUserListAction(-1, 250));
  };

  registUserInput = (event: any) => {
    const { dispatch } = this.props;
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    dispatch(initialStartupModal.actions.changeSubmitMode(false));
  };

  render() {
    const onHide = this.props.state.initialStartupModalState.onHide;
    const isError = this.props.state.userListState.isError.status;
    const userList = this.props.state.userListState['userList'];

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
                    {this.props.state.initialStartupModalState.isChangeUser && (
                      <div>
                        <Form.Control name='name' as='select' onChange={this.onUserChange}>
                          <option hidden>選択してください</option>
                          {userList
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
                    {!this.props.state.initialStartupModalState.isChangeUser && (
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
            <MaterialUiButton
              type='submit'
              variant='contained'
              color='primary'
              disabled={this.props.state.initialStartupModalState.submitButtonDisabled}
              style={{ boxShadow: 'none' }}
              className='initial-startup-modal-base-button'>
              登録
            </MaterialUiButton>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

const _InitialStartupModal = () => {
  const dispatch = useDispatch();
  const userInfo: any = new UserInfo();

  useEffect(() => {
    $('.nameForInput').focus();
  });

  const closeModal = () => {
    dispatch(initialStartupModal.actions.showModal(false));
  };

  const _addUser = async () => {
    userInfo['version'] = APP_VERSION;
    userInfo['status'] = '在席';

    // addUserAction で userListState の myUserID に新規ユーザIDが設定される
    await dispatch(addUserAction(userInfo));
    // TODO:useSelectorでstateを取得する
    const userList = useSelector((state: RootState) => state.userListState);
    if (userList.isError.status) {
      dispatch(initialStartupModal.actions.disableSubmitButton(false));
      return;
    }

    // useSelectorが呼ばれる回数は冪等性を保たなければならないため、以下の呼び出しばエラーとなる
    // 呼び出される前にreturnされる可能性がある
    const myUserID = useSelector((state: RootState) => state.userListState.addedUserInfo.id);
    dispatch(setMyUserIDActionCreator(myUserID));

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', myUserID);

    // orderパラメータをidと同じ値に更新する
    const addedUserInfo: any = {};
    addedUserInfo['order'] = myUserID;

    await dispatch(updateForAddedUserInfoAction(addedUserInfo, myUserID));
    dispatch(getUserListAction(myUserID));

    sendHeartbeat(dispatch);

    this.closeModal();
  };
};

export default InitialStartupModal;
