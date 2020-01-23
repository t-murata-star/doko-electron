import MaterialUiButton from '@material-ui/core/Button';
import $ from 'jquery';
import React, { useEffect } from 'react';
import { Button, Col, Container, Form, Modal } from 'react-bootstrap';
import UserListModule, { AsyncActionsUserList } from '../modules/userInfo/userListModule';
import AppModule from '../modules/appModule';
import { UserInfo, ApiResponse } from '../define/model';
import { getUserInfo, sendHeartbeat } from './common/functions';
import './InitialStartupModal.css';
import { useDispatch } from 'react-redux';
import initialStartupModal from '../modules/initialStartupModalModule';
import { APP_VERSION } from '../define';
import { useSelector } from 'react-redux';
import { RootState } from '../modules';
import store from '../store/configureStore';

const Store = window.require('electron-store');
const electronStore = new Store();

const InitialStartupModal = () => {
  const state = useSelector((state: RootState) => state);
  const Memo = React.useCallback(MemoComponent, [state.initialStartupModalState]);
  return <Memo></Memo>;
};

const MemoComponent = () => {
  const state = useSelector((state: RootState) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    $('.nameForInput').focus();
  });

  const closeModal = () => {
    dispatch(initialStartupModal.actions.showModal(false));
  };

  const _addUser = async () => {
    let response: any;

    dispatch(initialStartupModal.actions.setUserInfo(['version', APP_VERSION]));
    dispatch(initialStartupModal.actions.setUserInfo(['status', '在席']));

    // addUserAction で appState の myUserID に新規ユーザIDが設定される
    response = await dispatch(AsyncActionsUserList.addUserAction(state.initialStartupModalState.userInfo));
    console.log(response.getIsError());
    const userList = state.userListState;
    if (userList.isError) {
      dispatch(initialStartupModal.actions.disableSubmitButton(false));
      return;
    }
    const myUserID = store.getState().appState.myUserID;

    // userIDを設定ファイルに登録（既に存在する場合は上書き）
    electronStore.set('userID', myUserID);

    // orderパラメータをidと同じ値に更新する
    const addedUserInfo: any = {};
    addedUserInfo['order'] = myUserID;
    await dispatch(AsyncActionsUserList.updateForAddedUserInfoAction(addedUserInfo, myUserID));
    dispatch(AsyncActionsUserList.getUserListAction(myUserID));

    sendHeartbeat(dispatch);

    closeModal();
  };

  const _changeUser = async () => {
    const myUserID = state.initialStartupModalState.userID;
    const userList = state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    electronStore.set('userID', myUserID);
    dispatch(AppModule.actions.setMyUserId(myUserID));

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['version'] = APP_VERSION;

    // 状態が「退社」のユーザのみ、状態を「在席」に変更する
    if (userInfo['status'] === '退社') {
      updatedUserInfo['status'] = '在席';
    }

    await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
    if (state.userListState.isError === true) {
      return;
    }

    dispatch(UserListModule.actions.updateStateUserList(userList));
    closeModal();

    dispatch(AsyncActionsUserList.getUserListAction(myUserID, 250));
    sendHeartbeat(dispatch);
  };

  const onNameChange = (event: any) => {
    const target = event.currentTarget;
    dispatch(initialStartupModal.actions.setUserInfo([target.name, target.value]));
    dispatch(initialStartupModal.actions.disableSubmitButton(target.value.length === 0 ? true : false));
  };

  const onUserChange = (event: any) => {
    dispatch(initialStartupModal.actions.setUserId(parseInt(event.currentTarget.value)));
    dispatch(initialStartupModal.actions.disableSubmitButton(false));
  };

  const handleSubmit = (event: any) => {
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    event.preventDefault();

    if (state.initialStartupModalState.isChangeUser) {
      _changeUser();
    } else {
      _addUser();
    }
  };

  const changeUserInput = (event: any) => {
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    dispatch(initialStartupModal.actions.changeSubmitMode(true));
    // ユーザ一覧は表示されていないため退社チェックは実行されなくても問題ない
    dispatch(AsyncActionsUserList.getUserListAction(-1, 250));
  };

  const registUserInput = (event: any) => {
    dispatch(initialStartupModal.actions.disableSubmitButton(true));
    dispatch(initialStartupModal.actions.changeSubmitMode(false));
  };

  return (
    <Modal
      dialogClassName='initialStartupModal'
      show={state.initialStartupModalState.onHide}
      aria-labelledby='contained-modal-title-vcenter'
      centered
      backdrop='static'
      animation={true}
      size='xl'>
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>
          ユーザ登録
          {state.userListState.isError && <span className='error-message'>通信に失敗しました。</span>}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Container>
            <Form.Row>
              <Col md='2' />
              <Col md='8'>
                <Form.Group controlId='name'>
                  <Form.Label>氏名</Form.Label>
                  {state.initialStartupModalState.isChangeUser && (
                    <div>
                      <Form.Control name='name' as='select' onChange={onUserChange}>
                        <option hidden>選択してください</option>
                        {state.userListState.userList
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
                        <Button variant='link' className='modal-button-user-delete userChange' onClick={registUserInput}>
                          こちら
                        </Button>
                      </Form.Text>
                    </div>
                  )}
                  {!state.initialStartupModalState.isChangeUser && (
                    <div>
                      <Form.Control
                        className='nameForInput'
                        name='name'
                        placeholder='氏名を入力してください'
                        onChange={onNameChange}
                        maxLength={100}
                      />
                      <Form.Text>
                        <span>登録済みの場合は</span>
                        <Button variant='link' className='modal-button-user-delete userChange' onClick={changeUserInput}>
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
            disabled={state.initialStartupModalState.submitButtonDisabled}
            style={{ boxShadow: 'none' }}
            className='initial-startup-modal-base-button'>
            登録
          </MaterialUiButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InitialStartupModal;
