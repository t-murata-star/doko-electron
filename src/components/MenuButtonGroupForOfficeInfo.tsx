import React from 'react';
import { Row, Container, Col, Form } from 'react-bootstrap';
import { faPowerOff, faSync, faEdit, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import Button from '@material-ui/core/Button';
import './MenuButtonGroupForOfficeInfo.css';
import store from '../store/configureStore';
import { getRestroomUsageAction } from '../actions/officeInfo';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForOfficeInfo extends React.Component<any, any> {
  reload = async () => {
    const { dispatch } = this.props;
    await dispatch(getRestroomUsageAction(250));
  };

  render() {
    const officeInfo = store.getState().officeInfoState;

    return (
      <Row className='menu-button-group-for-user-list'>
        <Container>
          <Form.Row>
            <Form.Group as={Col} controlId='reload'>
              <Button
                variant='outlined'
                color='default'
                onClick={this.reload}
                disabled={officeInfo.isFetching === true}
                className='menu-button-group-for-user-list-base-button'
                style={{ boxShadow: 'none' }}>
                <FontAwesomeIcon icon='sync' />
                &nbsp;再読込
              </Button>
            </Form.Group>
          </Form.Row>
        </Container>
      </Row>
    );
  }
}

export default MenuButtonGroupForOfficeInfo;
