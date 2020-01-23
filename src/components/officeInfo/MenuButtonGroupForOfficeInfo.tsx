import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faPowerOff, faSync, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import './MenuButtonGroupForOfficeInfo.css';
import { AsyncActionsOfficeInfo } from '../../modules/officeInfo/officeInfoModule';
import { connect } from 'react-redux';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForOfficeInfo extends React.Component<any, any> {
  reload = async () => {
    const { dispatch } = this.props;
    await dispatch(AsyncActionsOfficeInfo.getRestroomUsageAction(250));
  };

  render() {
    const officeInfo = this.props.state.officeInfoState;

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

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(MenuButtonGroupForOfficeInfo);
