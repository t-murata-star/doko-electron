import React from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';
import { ReactTabulator } from 'react-tabulator';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import store from '../store/configureStore';
import { getUserListAction, changeOrderAction } from '../actions/userList';
import { disableSubmitButtonActionCreator } from '../actions/userEditModal';
import { UserInfo } from '../define/model';
const { remote } = window.require('electron');

class UserList extends React.Component<any, any> {
  formatter = (cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    if (email !== '') {
      return '<input type="button" value="表示" class="btn btn-link link_display_calendar" />';
    } else {
      return;
    }
  };

  openCalendar = (e: any, cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    if (email === '') {
      return;
    }

    const encodedEmail = encodeURI(email);

    let calendarWindow: any = new remote.BrowserWindow({
      width: 1120,
      height: 700,
      resizable: false,
      fullscreen: false,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      parent: remote.getCurrentWindow()
    });
    calendarWindow.setMenuBarVisibility(false);

    calendarWindow.on('closed', () => {
      calendarWindow = null;
      remote.getCurrentWindow().setEnabled(true);
      remote.getCurrentWindow().focus();
    });
    calendarWindow.loadURL(
      `https://calendar.google.com/calendar/embed?src=${encodedEmail}&ctz=Asia%2FTokyo&mode=WEEK&showTitle=0&showTz=0&showPrint=0`
    );

    remote.getCurrentWindow().setEnabled(false);
  };

  TABLE_COLUMNS: any = [
    { rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 25, minWidth: 25, resizable: false },
    { title: '順序', field: 'order', visible: false, headerSort: false, sorter: 'number' },
    { title: '氏名', field: 'name', width: 150, headerSort: false },
    { title: '状態', field: 'status', width: 100, headerSort: false },
    { title: '行き先', field: 'destination', width: 300, headerSort: false },
    { title: '戻り', field: 'return', width: 150, headerSort: false },
    {
      title: '更新日時',
      field: 'updatedAt',
      width: 85,
      headerSort: false,
      sorter: 'datetime',
      sorterParams: { format: 'YYYY-MM-DD hh:mm:ss.SSS' },
      formatter: 'datetime',
      formatterParams: {
        outputFormat: 'YYYY/MM/DD',
        invalidPlaceholder: ''
      }
    },
    {
      title: 'カレンダー',
      field: 'email',
      align: 'center',
      width: 80,
      headerSort: false,
      tooltip: false,
      formatter: this.formatter,
      cellClick: this.openCalendar
    },
    { title: 'メッセージ', field: 'message', headerSort: false }
  ];

  _getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
    if (!userList) {
      return null;
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || null;
  };

  showUserEditModal = (e: any, row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const selectedUserId = row.getData()['id'];
    const userInfo = this._getUserInfo(userList, selectedUserId);

    if (userInfo === null) {
      return;
    }

    dispatch(disableSubmitButtonActionCreator());
    dispatch(showUserEditModalActionCreator(selectedUserId, userInfo));
  };

  _rowFormatter = (row: Tabulator.RowComponent) => {
    const rowData = row.getData();
    // 状態によってテキストの色を変える
    switch (rowData.status) {
      case '退社':
        row.getElement().style.color = '#0000FF';
        break;
      case '年休':
        row.getElement().style.color = '#FF0000';
        break;
      case 'AM半休':
        row.getElement().style.color = '#00A900';
        break;
      case 'PM半休':
        row.getElement().style.color = '#FF0000';
        break;
      case 'FLEX':
        row.getElement().style.color = '#00A900';
        break;
      case '出張':
        row.getElement().style.color = '#0000FF';
        break;
      case '外出':
        row.getElement().style.color = '#0000FF';
        break;
      case '本社外勤務':
        row.getElement().style.color = '#0000FF';
        break;
      case '行方不明':
        row.getElement().style.color = '#FF0000';
        break;
      case '遅刻':
        row.getElement().style.color = '#00A900';
        break;
      case '接客中':
        row.getElement().style.color = '#00A900';
        break;
      default:
        break;
    }
    // 自分の名前を太字にする
    if (rowData.id === store.getState().userListState['myUserID']) {
      row.getCell('name').getElement().style.fontWeight = 'bold';
    }
  };

  // 各ユーザの「order」パラメータをユーザ一覧の表示順序を元に更新する
  _updateUserInfoOrder = (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const rows = row.getTable().getRows();

    return new Promise(resolve => {
      rows.forEach(async (row: Tabulator.RowComponent, index: number) => {
        const patchInfoUser = { order: row.getPosition(true) + 1 };
        await dispatch(changeOrderAction(patchInfoUser, row.getData().id));
        if (index + 1 === rows.length) {
          resolve();
        }
      });
    });
  };

  _rowMovedCallback = async (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;

    await this._updateUserInfoOrder(row);
    dispatch(getUserListAction());
  };

  render() {
    const { userList } = this.props;
    return (
      // ReactTabulatorで発生するエラーを @ts-ignore を用いて無視
      // ※なぜか placeholder の型定義が存在しないため（公式の不具合？）
      // @ts-ignore
      <ReactTabulator
        className='user-list'
        data={userList}
        columns={this.TABLE_COLUMNS}
        tooltips={true}
        layout={'fitData'}
        height={window.innerHeight - 87}
        rowDblClick={this.showUserEditModal}
        resizableColumns={true}
        rowFormatter={this._rowFormatter}
        placeholder={'通信に失敗しました。'}
        options={{
          movableRows: true,
          initialSort: [{ column: 'updatedAt', dir: 'asc' }, { column: 'order', dir: 'asc' }]
        }}
        rowMoved={this._rowMovedCallback}
      />
    );
  }
}

export default UserList;
