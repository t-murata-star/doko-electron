import React, { Component } from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';
import { ReactTabulator } from 'react-tabulator'
import { TABLE_COLUMNS } from '../define';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import store from '../store/configureStore';

const Store = window.require('electron-store');
const electronStore = new Store();

class UserList extends Component {
  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList
      .filter(userInfo => {
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
    const rowData = row.getData();
    // 状態によってテキストの色を変える
    switch (rowData.status) {
      case '退社':
        row.getElement().style.color = "#0000FF";
        break;
      case '年休':
        row.getElement().style.color = "#FF0000";
        break;
      case 'AM半休':
        row.getElement().style.color = "#00A900";
        break;
      case 'PM半休':
        row.getElement().style.color = "#FF0000";
        break;
      case 'FLEX':
        row.getElement().style.color = "#00A900";
        break;
      case '出張':
        row.getElement().style.color = "#0000FF";
        break;
      case '外出':
        row.getElement().style.color = "#0000FF";
        break;
      case '本社外勤務':
        row.getElement().style.color = "#0000FF";
        break;
      case '行方不明':
        row.getElement().style.color = "#FF0000";
        break;
      case '遅刻':
        row.getElement().style.color = "#00A900";
        break;
      case '接客中':
        row.getElement().style.color = "#00A900";
        break;
      default:
        break;
    }
    // 在席で、かつ離席中の場合、テキストの文字色を薄くする
    if (rowData.status === '在席' && rowData.isLeaving === true) {
      row.getElement().style.color = "#888";
    }
    // 自分の名前を太字にする
    if (rowData.id === electronStore.get('userID')) {
      row.getCell('name').getElement().style.fontWeight = 'bold';
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
          initialSort={[{ column: "order", dir: "asc" }]}
          rowDblClick={this.showModal}
          resizableColumns={'header'}
          rowFormatter={this._rowFormatter}
        />
      </div>
    );
  }
}

export default UserList;
