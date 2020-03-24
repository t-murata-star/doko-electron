import { library } from '@fortawesome/fontawesome-svg-core';
import { faDoorClosed, faDoorOpen, faFemale, faMale } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Form, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import './OfficeInfo.css';
import { Props } from '../../define/model';
import { Grid, Paper } from '@material-ui/core';
import MenuButtonGroupForOfficeInfo from './MenuButtonGroupForOfficeInfo';

library.add(faDoorOpen, faDoorClosed, faMale, faFemale); //あらかじめ使用するアイコンを追加しておく

class OfficeInfo extends React.Component<Props, any> {
  render() {
    const officeInfo = this.props.state.officeInfoState;
    console.log(officeInfo);

    return (
      <div className='office_info'>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className='paper'>xs=12</Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className='paper'>xs=12 sm=6</Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className='paper'>xs=12 sm=6</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className='paper'>xs=6 sm=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className='paper'>xs=6 sm=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className='paper'>xs=6 sm=3</Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className='paper'>xs=6 sm=3</Paper>
          </Grid>
        </Grid>
        <h4 style={{ textAlign: 'center' }}>トイレ利用状況</h4>
        <Row>
          <Col md='2' />
          <Col md='4'>
            <ListGroup>
              <ListGroup.Item className='toilet-women'>
                <Form.Label>
                  <FontAwesomeIcon icon='female' style={{ color: 'red' }} /> 女性
                </Form.Label>
                <p>&nbsp;</p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='4'>
            <ListGroup>
              <ListGroup.Item>
                <Form.Label>
                  <FontAwesomeIcon icon='male' style={{ color: 'blue' }} /> 男性(個室)
                </Form.Label>
                {officeInfo.restrooms.isNoVacancyForMen === true && officeInfo.isError === false && (
                  <div style={{ color: 'red' }}>
                    <p>
                      <FontAwesomeIcon icon='door-closed' /> 満室
                    </p>
                  </div>
                )}
                {officeInfo.restrooms.isNoVacancyForMen === false && officeInfo.isError === false && (
                  <div style={{ color: 'blue' }}>
                    <p>
                      <FontAwesomeIcon icon='door-open' /> 空室：
                      {officeInfo.restrooms.vacancyForMen === -1 ? '-' : officeInfo.restrooms.vacancyForMen}
                    </p>
                  </div>
                )}
                {officeInfo.isError === true && (
                  <div style={{ color: 'red' }}>
                    <p>通信に失敗しました。</p>
                  </div>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
        <MenuButtonGroupForOfficeInfo />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(OfficeInfo);
