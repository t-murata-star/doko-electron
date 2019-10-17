import React, { Component } from 'react';
import { Row, Container, Col, Form } from 'react-bootstrap';
import './MenuButtonGroupForOfficeInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPowerOff, faSync, faEdit, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import store from '../store/configureStore';
import MaterialButton from '@material/react-button';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForOfficeInfo extends Component {
  reload = async () => {
    // const { dispatch } = this.props;
  };

  render() {
    const userList = store.getState().userListState;

    return (
      <Row className='menu-button-group-for-user-list'>
        <Container>
          <Form.Row>
            <Form.Group as={Col} controlId='reload'>
              <MaterialButton
                outlined
                type='button'
                className='w-100 button-primary'
                onClick={this.reload}
                disabled={userList.isFetching === true}>
                <FontAwesomeIcon icon='sync' /> 再読込
              </MaterialButton>
            </Form.Group>
          </Form.Row>
        </Container>
      </Row>
    );
  }
}

export default MenuButtonGroupForOfficeInfo;
