import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { getEmployeeList, updateEmployeeInfo } from '../actions';
import store from '../store/configureStore';

const { remote } = window.require('electron');

class MenuButtonGroup extends Component {
  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  }

  reload = () => {
    const { dispatch } = this.props;
    dispatch(getEmployeeList());
  }

  edit_myself = () => {
    const { dispatch } = this.props;
    let employeeInfo = this._getEmployeeInfo(1);
    const id = 1;
    dispatch(updateEmployeeInfo(employeeInfo, id));
  }

  minimize = () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  }

  _getEmployeeInfo = (id) => {
    const employeeInfo = store.getState().employeeList['employeeList']
      .filter(function (employeeInfo) {
        return employeeInfo['id'] === 1;
      })[0];
    return employeeInfo;
  }

  render() {

    return (
      <div className='row'>
        <div className='container'>
          <ButtonToolbar>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.close}>終了</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.reload}>再読込</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.edit_myself}>自分編集</Button></div>
            <div className='col-3 menu-button-group'><Button variant='light' className='w-100' onClick={this.minimize}>最小化</Button></div>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

export default MenuButtonGroup;
