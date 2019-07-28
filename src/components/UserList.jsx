import React, { Component } from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';
import { ReactTabulator } from 'react-tabulator'
import { TABLE_COLUMNS } from '../define';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import store from '../store/configureStore';

class UserList extends Component {
  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList
      .filter(function (userInfo) {
        return userInfo['id'] === userID;
      })[0];
    return userInfo || {};
  }

  showModal = (e, row) => {
    const { dispatch } = this.props;
    const userList = store.getState().userList['userList'];
    const selectedUserId = row.getData()['id'];
    const userInfo = this._getUserInfo(userList, selectedUserId);
    dispatch(showUserEditModalActionCreator(selectedUserId, userInfo));
  }

  _rowFormatter = (row) => {
    switch (row.getData().status) {
      case '退社':
        row.getElement().style.color = "#0000FF";
        break;

      default:
        break;
    }
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
          rowFormatter={this._rowFormatter}
        />
      </div>
    );
  }
}

export default UserList;
