import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/lib/css/tabulator.min.css';
class EmployeeList extends Component {
  constructor(props) {
    super(props);
    this.employeeList = [
      { id: 1, name: 'テスト', status: '本社外勤務', destination: 'テストテストテストテストテスト', return: '7/20 16:00', update_at: '2019/07/10', message: 'Hi there!' },
      { id: 2, name: 'テストテスト', status: '在席', destination: '', return: '', update_at: '2019/07/10', message: 'こんにちは！' },
      { id: 3, name: 'テストテストテスト', status: '離席', destination: '', return: '', update_at: '2019/07/10', message: '' },
    ];
    this.columns = [
      { title: "氏名", field: "name", width: 150, headerSort: false },
      { title: "状態", field: "status", width: 100, headerSort: false },
      { title: "行き先", field: "destination", width: 270, headerSort: false },
      { title: "戻り", field: "return", width: 130, headerSort: false },
      { title: "更新日時", field: "update_at", width: 100, headerSort: false },
      { title: "メッセージ", field: "message", headerSort: false }
    ];
  }

  render() {
    return (
        <div className='employee-list'>
        <ReactTabulator
          data={this.employeeList}
          columns={this.columns}
          tooltips={true}
          layout={"fitData"}
          height="530px"
      />
      </div>
    );
  }
}

class Menu extends Component {
  termination = () => {
    alert('終了')
  }

  reload = () => {
    alert('再読込')
  }

  edit_myself = () => {
    alert('自分編集')
  }

  minimize = () => {
    alert('最小化')
  }

  render() {

    return (
      <div className='row'>
        <div className='container'>
          <ButtonToolbar>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.termination}>終了</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.reload}>再読込</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.edit_myself}>自分編集</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.minimize}>最小化</Button></div>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    }
  }

  render() {
    return (
      <div>
        {/* <h1>, <Name name={name} />.</h1>
        <input type='text' value={name} onChange={e => {
          this.setState({ name: e.target.value })
        }} /> */}
        <EmployeeList />
        <Menu />
      </div>
    );
  }
}
