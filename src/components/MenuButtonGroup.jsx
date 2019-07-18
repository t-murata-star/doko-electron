import React, { Component } from 'react';
import { Row, Container, Col, Button, ButtonToolbar} from 'react-bootstrap';
import { getEmployeeList, updateEmployeeInfo } from '../actions';
import store from '../store/configureStore';
import './MenuButtonGroup.css';

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
      <Row>
        <Container>
          <ButtonToolbar className='menu-button-group'>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.close}>終了</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.reload}>再読込</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.edit_myself}>自分編集</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.minimize}>最小化</Button></Col>
          </ButtonToolbar>
        </Container>
      </Row>
    );
  }
}

export default MenuButtonGroup;
