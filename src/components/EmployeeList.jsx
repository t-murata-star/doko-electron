import React, { Component } from 'react';
import { getEmployeeList } from '../actions';
import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/lib/css/tabulator.min.css';
import { TABLE_COLUMNS } from '../define';


class EmployeeList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getEmployeeList());
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props
    // APIリクエストでエラーが発生した場合、メッセージを表示する
    if (nextProps.isError.status === true) {
      // TODO: 新規ウインドウでポップアップは出さず、インジケータで表示する。
    }
  }

  render() {
    const { employeeList, isFetching, isError } = this.props;
    return (
      <div className='employee-list'>
          <ReactTabulator
            data={employeeList}
            columns={TABLE_COLUMNS}
            tooltips={true}
            layout={"fitData"}
            height="530px"
          />
      </div>
    );
  }
}

export default EmployeeList;
