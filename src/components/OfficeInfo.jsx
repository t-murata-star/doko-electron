import React, { Component } from 'react';
import './OfficeInfo.css';
import store from '../store/configureStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDoorOpen, faDoorClosed, faMale, faFemale } from '@fortawesome/free-solid-svg-icons';
import { Col, Row } from 'react-bootstrap';
import Card from '@material/react-card';

library.add(faDoorOpen, faDoorClosed, faMale, faFemale); //あらかじめ使用するアイコンを追加しておく

// ローディングインジケータ
class OfficeInfo extends Component {
  render() {
    const officeInfo = store.getState().officeInfoState;
    console.log(officeInfo);

    return (
      <div className='office_info'>
        <Row>
          <Col md='1' />
          <Col md='5'>
            <Card>
              <h4>
                <h4>
                  <FontAwesomeIcon icon='female' style={{ color: 'red' }} /> 女性トイレ
                </h4>
              </h4>
              <p>Content</p>
            </Card>
          </Col>
          <Col md='5'>
            <Card>
              <h4>
                <h4>
                  <FontAwesomeIcon icon='male' style={{ color: 'blue' }} /> 男性トイレ(個室)
                </h4>
              </h4>
              <p>Comming soon</p>
            </Card>
          </Col>
          <Col md='1' />
        </Row>
      </div>
    );
  }
}

export default OfficeInfo;
