import React, { Component } from 'react';
import { fetchEmployeeList } from '../actions';
import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/lib/css/tabulator.min.css';
import Loading from './Loading'
import './EmployeeList.css';

class EmployeeList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchEmployeeList());
  }

  render() {
    const columns = [
      { title: "氏名", field: "name", width: 150, headerSort: false },
      { title: "状態", field: "status", width: 100, headerSort: false },
      { title: "行き先", field: "destination", width: 270, headerSort: false },
      { title: "戻り", field: "return", width: 130, headerSort: false },
      { title: "更新日時", field: "update_at", width: 100, headerSort: false },
      { title: "メッセージ", field: "message", headerSort: false }
    ];

    // const employeeList = [
    //   { id: 1, name: 'テスト', status: '本社外勤務', destination: 'テストテストテストテストテスト', return: '7/20 16:00', update_at: '2019/07/10', message: 'Hi there!' },
    //   { id: 2, name: 'テストテスト', status: '在席', destination: '', return: '', update_at: '2019/07/10', message: 'こんにちは！' },
    //   { id: 3, name: 'テストテストテスト', status: '離席', destination: '', return: '', update_at: '2019/07/10', message: '' },
    // ];

    const { employeeList, isFetching, isError } = this.props;
    return (
      <div className='employee-list'>
        <Loading isFetching={isFetching} />
          <ReactTabulator
            data={employeeList}
            columns={columns}
            tooltips={true}
            layout={"fitData"}
            height="530px"
        />
      </div>
    );
  }
}

export default EmployeeList;
