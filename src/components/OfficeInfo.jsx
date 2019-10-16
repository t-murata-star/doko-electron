import React, { Component } from 'react';
import './Loading.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Col, Form } from 'react-bootstrap';
import Card from '@material/react-card';

library.add(faSpinner); //あらかじめ使用するアイコンを追加しておく

// ローディングインジケータ
class OfficeInfo extends Component {
  render() {
    return (
      <Form.Row>
        <Col md='2' />
        <Col md='8'>
          <Card>
            <h1>Title</h1>
            <p>Content</p>
          </Card>
        </Col>
        <Col md='2' />
      </Form.Row>
    );
  }
}

export default OfficeInfo;
