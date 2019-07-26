import React, { Component } from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';
import { getUserListAction } from '../actions/userList';
import { ReactTabulator } from 'react-tabulator'
import { TABLE_COLUMNS } from '../define';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import store from '../store/configureStore';
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';

const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class UserList extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getUserListAction())
      .then(
        () => {
          const nextProps = this.props;
          if (nextProps.isError.status === false) {
            const userID = electronStore.get('userID');
            if (this._existMyUserID(userID) === false) {
              remote.dialog.showMessageBox(null, {
                type: 'info',
                buttons: ['OK'],
                message: 'ユーザ情報が存在しません。\n新規ユーザ登録を行います。',
              });
              dispatch(showInitialStartupModalActionCreator());
            }
          }
        }
      );
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props
    // APIリクエストでエラーが発生した場合、メッセージを表示する
    if (nextProps.isError.status === true) {
      // TODO: 新規ウインドウでポップアップは出さず、インジケータで表示する。
    }
  }

  _getUserInfo = (userID) => {
    const userList = store.getState().userList['userList'];

    if (userList.length === 0) {
      return {};
    }
    const userInfo = userList
      .filter(function (userInfo) {
        return userInfo['id'] === userID;
      })[0];
    return userInfo;
  }

  _existMyUserID = (userID) => {
    const userList = store.getState().userList['userList'];
    const userInfo = userList
      .filter(function (userInfo) {
        return userInfo['id'] === userID;
      })[0];
    return userInfo !== void 0;
  }

  showModal = (e, row) => {
    const { dispatch } = this.props;
    const selectedUserId = row.getData()['id'];
    const userInfo = this._getUserInfo(selectedUserId);
    dispatch(showUserEditModalActionCreator(selectedUserId, userInfo));
  }

  render() {
    const { userList } = this.props;
    return (
      <div className='user-list'>
        <ReactTabulator
          data={userList}
          columns={TABLE_COLUMNS}
          tooltips={true}
          layout={"fitData"}
          height="530px"
          initialSort={[{ column: "id", dir: "asc" }]}
          rowDblClick={this.showModal}
          resizableColumns={'header'}
        />
      </div>
    );
  }
}

export default UserList;
