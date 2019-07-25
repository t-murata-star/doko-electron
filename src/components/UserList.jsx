import React, { Component } from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';

import { getUserListAction, selectUserAction } from '../actions/userList';
import { ReactTabulator } from 'react-tabulator'
import { TABLE_COLUMNS } from '../define';
import { showUserEditModalActionCreator } from '../actions/userEditModal';

class UserList extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getUserListAction());
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props
    // APIリクエストでエラーが発生した場合、メッセージを表示する
    if (nextProps.isError.status === true) {
      // TODO: 新規ウインドウでポップアップは出さず、インジケータで表示する。
    }
  }

  showModal = (e, row) => {
    const { dispatch } = this.props;
    const selectedUserId = row.getData()['id'];
    dispatch(selectUserAction(selectedUserId));
    dispatch(showUserEditModalActionCreator());
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
