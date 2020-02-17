import React from 'react';
import { connect } from 'react-redux';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/css/tabulator.min.css';
import 'react-tabulator/lib/styles.css';
import { CALENDAR_URL, EMAIL_DOMAIN, USER_STATUS_INFO } from '../../define';
import AppModule from '../../modules/appModule';
import UserEditModalMdule from '../../modules/userInfo/userEditModalModule';
import UserListModule, { AsyncActionsUserList } from '../../modules/userInfo/userListModule';
import { getUserInfo, showMessageBoxSyncWithReturnValue } from '../common/functions';
import Inoperable from '../Inoperable';
import './UserList.css';
import { Props } from '../../define/model';

const { remote } = window.require('electron');

class UserList extends React.Component<Props, any> {
  shouldComponentUpdate(nextProps: any) {
    return (
      this.props.state.userListState.inoperable !== nextProps.state.userListState.inoperable ||
      this.props.state.userListState.userList !== nextProps.state.userListState.userList
    );
  }

  formatter = (cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    if (email !== '') {
      return '<input type="button" value="　  表示 　" class="btn btn-link link_display_calendar" />';
    } else {
      return '-';
    }
  };

  openCalendar = (e: any, cell: Tabulator.CellComponent) => {
    const email = cell.getValue();
    const { dispatch } = this.props;

    if (email === '') {
      return;
    }

    // 親ウインドウを操作不可にする
    dispatch(UserListModule.actions.inoperable(true));

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
      dispatch(UserListModule.actions.inoperable(false));
    });
  };

  COLUMNS_CONFIG_FOR_TABULATOR: any = [
    { rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 25, minWidth: 25 },
    { title: '順序', field: 'order', visible: false, headerSort: false, sorter: 'number' },
    { title: '氏名', field: 'name', width: 120, headerSort: false },
    { title: '状態', field: 'status', width: 100, headerSort: false },
    { title: '行き先', field: 'destination', widthGrow: 1.1, minWidth: 100, headerSort: false },
    { title: '戻り', field: 'return', widthGrow: 0.6, headerSort: false },
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
    { title: 'メッセージ', field: 'message', headerSort: false, minWidth: 80 }
  ];

  showUserEditModal = (e: any, row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const userList = this.props.state.userListState['userList'];
    const selectedUserId = row.getData()['id'];
    const userInfo = getUserInfo(userList, selectedUserId);

    if (userInfo === null) {
      return;
    }

    dispatch(UserEditModalMdule.actions.disableSubmitButton());
    dispatch(UserEditModalMdule.actions.showUserEditModal([selectedUserId, userInfo]));
  };

  _rowFormatter = (row: Tabulator.RowComponent) => {
    const rowData = row.getData();

    // 状態によってテキストの色を変える
    const statusInfo: any = Object.entries(USER_STATUS_INFO)
      .filter(([, value]: [string, { status: string; color: string }]) => {
        return value.status === rowData.status;
      })
      .map((value: [string, any][]) => {
        return value[1];
      });

    if (statusInfo.length > 0) {
      row.getElement().style.color = statusInfo[0].color;
    }

    // 自分の名前を太字にする
    if (rowData.id === this.props.state.appState['myUserID']) {
      row.getCell('name').getElement().style.fontWeight = 'bold';
    }
  };

  // 各ユーザの「order」パラメータをユーザ一覧の表示順序を元に更新する
  _updateUserInfoOrder = async (rowComponent: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const rows = rowComponent.getTable().getRows();
    const index = showMessageBoxSyncWithReturnValue(
      'OK',
      'Cancel',
      `並べ替えてよろしいですか？\n※表示順序は全てのユーザで共通です。`
    );

    if (index !== 0) {
      return;
    }

    dispatch(AppModule.actions.setProcessingStatus(true));
    for (const row of rows) {
      const patchInfoUser = { order: row.getPosition(true) + 1 };
      await dispatch(AsyncActionsUserList.changeOrderAction(patchInfoUser, row.getData().id));
      await this._sleep(50);
    }
    dispatch(UserListModule.actions.changeOrderSuccess());
    dispatch(AppModule.actions.setProcessingStatus(false));
    return;
  };

  _rowMovedCallback = async (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    await this._updateUserInfoOrder(row);
    dispatch(AsyncActionsUserList.getUserListAction(myUserID));
  };

  _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

  render() {
    const userList = JSON.parse(JSON.stringify(this.props.state.userListState.userList));

    return (
      // React-tabulatorのTypeScript型定義が未対応のため、@ts-ignoreでエラーを抑制
      <div>
        <Inoperable enabled={this.props.state.userListState.inoperable} />
        {/*
        // @ts-ignore */}
        <ReactTabulator
          className='user-list'
          data={userList}
          columns={this.COLUMNS_CONFIG_FOR_TABULATOR}
          tooltips={true}
          layout={'fitData'}
          columnMinWidth={80}
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

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(UserList);
