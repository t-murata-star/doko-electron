import { library } from '@fortawesome/fontawesome-svg-core';
import { faDoorClosed, faDoorOpen, faFemale, faMale } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import './OfficeInfo.css';
import { Props } from '../../define/model';
import { Grid, Paper } from '@material-ui/core';
import MenuButtonGroupForOfficeInfo from './MenuButtonGroupForOfficeInfo';

library.add(faDoorOpen, faDoorClosed, faMale, faFemale); //あらかじめ使用するアイコンを追加しておく

class OfficeInfo extends React.Component<Props, any> {
  render() {
    const officeInfo = this.props.state.officeInfoState;

    return (
      <div className='office_info'>
        <h4 style={{ textAlign: 'center' }}>執務室</h4>
        <Grid container justify='center' alignItems='center' spacing={3} className='info'>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              気温
              <div className='info_content'>
                {officeInfo.info.tempreture === -1 ? '-' : officeInfo.info.tempreture.toFixed(1)}
                <span className='info_content_unit'>℃</span>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              湿度
              <div className='info_content'>
                {officeInfo.info.humidity === -1 ? '-' : officeInfo.info.humidity.toFixed(1)}
                <span className='info_content_unit'>%</span>
              </div>
            </Paper>
          </Grid>
        </Grid>
        <h4 style={{ textAlign: 'center' }}>トイレ使用状況</h4>
        <Grid container justify='center' alignItems='center' spacing={3}>
          <Grid item xs={4}>
            <Paper className='paper restroom-women' elevation={2}>
              <FontAwesomeIcon icon='female' style={{ color: 'red' }} /> 女性
              <div className='restrooms_content_women'>&nbsp;</div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              <FontAwesomeIcon icon='male' style={{ color: 'blue' }} /> 男性(個室)
              {officeInfo.restrooms.isNoVacancyForMen === true && (
                <div className='restrooms_content_no_vacancy'>
                  <FontAwesomeIcon icon='door-closed' /> 満室
                </div>
              )}
              {officeInfo.restrooms.isNoVacancyForMen === false && (
                <div className='restrooms_content_vacancy'>
                  <FontAwesomeIcon icon='door-open' /> 空室
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>
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
