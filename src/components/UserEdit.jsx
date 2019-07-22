import './UserEdit.css';
import React, { Component } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { showModalAction } from '../actions/userEdit';
import UserEditModal from '../containers/UserEditModal';

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class UserEdit extends Component {
  showModal = () => {
    const { dispatch } = this.props;
    dispatch(showModalAction());
  }

  render() {
    return (
      <ButtonToolbar>
        <Button variant='light' className='w-100' onClick={this.showModal}>
          <FontAwesomeIcon icon='edit' /> 自分編集
      </Button>
        <UserEditModal />
      </ButtonToolbar>
    )
  }
}

export default UserEdit;
