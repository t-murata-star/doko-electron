import React from 'react';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/css/tabulator.min.css';
import 'react-tabulator/lib/styles.css';
import { setProcessingStatusActionCreator } from '../../actions/app';
import { disableSubmitButtonActionCreator, showUserEditModalActionCreator } from '../../actions/userInfo/userEditModal';
import { changeOrderAction, getUserListAction } from '../../actions/userInfo/userList';
import { CALENDAR_URL, EMAIL_DOMAIN } from '../../define';
import store from '../../store/configureStore';
import { getUserInfo, showMessageBoxWithReturnValue } from '../common/functions';
import Inoperable from '../Inoperable';
import './UserList.css';

const { remote } = window.require('electron');

class UserList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      inoperable: false
    };
  }

  formatter = (cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    if (email !== '') {
      return '<input type="button" value="　 表示 　" class="btn btn-link link_display_calendar" />';
    } else {
      return '-';
    }
  };

  openCalendar = (e: any, cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    if (email === '') {
      return;
    }

    // 親ウインドウを操作不可にする
    this.setState({ inoperable: true });

    const encodedEmail = encodeURI(email);
    // カレンダー表示のための子ウインドウを表示
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
    calendarWindow.loadURL(`${CALENDAR_URL}&src=${encodedEmail}${EMAIL_DOMAIN}&`);

    calendarWindow.on('closed', () => {
      calendarWindow = null;
      this.setState({ inoperable: false });
    });
  };

  COLUMNS_CONFIG_FOR_TABULATOR: any = [
    { rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 25, minWidth: 25 },
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

  showUserEditModal = (e: any, row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const selectedUserId = row.getData()['id'];
    const userInfo = getUserInfo(userList, selectedUserId);

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
    if (rowData.id === store.getState().appState['myUserID']) {
      row.getCell('name').getElement().style.fontWeight = 'bold';
    }
  };

  // 各ユーザの「order」パラメータをユーザ一覧の表示順序を元に更新する
  _updateUserInfoOrder = (rowComponent: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const rows = rowComponent.getTable().getRows();
    const index = showMessageBoxWithReturnValue(
      'OK',
      'Cancel',
      `並べ替えてよろしいですか？\n※表示順序は全てのユーザで共通です。`
    );

    if (index !== 0) {
      return;
    }

    dispatch(setProcessingStatusActionCreator(true));
    return new Promise(async resolve => {
      for (const row of rows) {
        const patchInfoUser = { order: row.getPosition(true) + 1 };
        await dispatch(changeOrderAction(patchInfoUser, row.getData().id));
        await this._sleep(50);
      }
      resolve();
      dispatch(setProcessingStatusActionCreator(false));
    });
  };

  _rowMovedCallback = async (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const myUserID = store.getState().appState.myUserID;

    await this._updateUserInfoOrder(row);
    dispatch(getUserListAction(myUserID));
  };

  _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

  render() {
    const { userList } = this.props;
    return (
      <div>
        <Inoperable enabled={this.state.inoperable} />
        {/*
        // @ts-ignore */}
        <ReactTabulator
          className='user-list'
          data={userList}
          columns={this.COLUMNS_CONFIG_FOR_TABULATOR}
          tooltips={true}
          layout={'fitData'}
          height={window.innerHeight - 87}
          rowDblClick={this.showUserEditModal}
          resizableColumns={false}
          // @ts-ignore
          rowFormatter={this._rowFormatter}
          placeholder={'通信に失敗しました。'}
          options={{
            movableRows: true,
            initialSort: [
              { column: 'updatedAt', dir: 'asc' },
              { column: 'order', dir: 'asc' }
            ]
          }}
          rowMoved={this._rowMovedCallback}
        />
      </div>
    );
  }
}

export default UserList;
