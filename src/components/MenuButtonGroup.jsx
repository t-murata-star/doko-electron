import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import './MenuButtonGroup.css';

class MenuButtonGroup extends Component {
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

export default MenuButtonGroup;
