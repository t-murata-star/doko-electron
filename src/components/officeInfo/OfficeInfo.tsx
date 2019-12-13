import { library } from '@fortawesome/fontawesome-svg-core';
import { faDoorClosed, faDoorOpen, faFemale, faMale } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Form, ListGroup, Row } from 'react-bootstrap';
import store from '../../store/configureStore';
import './OfficeInfo.css';

library.add(faDoorOpen, faDoorClosed, faMale, faFemale); //あらかじめ使用するアイコンを追加しておく

class OfficeInfo extends React.Component<any, any> {
  render() {
    const officeInfo = store.getState().officeInfoState;

    return (
      <div className='office_info'>
        <h4 style={{ textAlign: 'center' }}>トイレ利用状況</h4>
        <Row>
          <Col md='2' />
          <Col md='4'>
            <ListGroup>
              <ListGroup.Item>
                <Form.Label>
                  <FontAwesomeIcon icon='female' style={{ color: 'red' }} /> 女性
                </Form.Label>
                <p>Coming never!</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='4'>
            <ListGroup>
              <ListGroup.Item>
                <Form.Label>
                  <FontAwesomeIcon icon='male' style={{ color: 'blue' }} /> 男性(個室)
                </Form.Label>
                {officeInfo.restrooms.isNoVacancyForMen === true && officeInfo.isError.status === false && (
                  <div style={{ color: 'red' }}>
                    <p>
                      <FontAwesomeIcon icon='door-closed' /> 満室
                    </p>
                  </div>
                )}
                {officeInfo.restrooms.isNoVacancyForMen === false && officeInfo.isError.status === false && (
                  <div style={{ color: 'blue' }}>
                    <p>
                      <FontAwesomeIcon icon='door-open' /> 空室：
                      {officeInfo.restrooms.vacancyForMen === -1 ? '-' : officeInfo.restrooms.vacancyForMen}
                    </p>
                  </div>
                )}
                {officeInfo.isError.status === true && (
                  <div style={{ color: 'red' }}>
                    <p>通信に失敗しました。</p>
                  </div>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
      </div>
    );
  }
}

export default OfficeInfo;
