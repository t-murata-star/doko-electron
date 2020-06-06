import { library } from '@fortawesome/fontawesome-svg-core';
import { faDoorClosed, faDoorOpen, faFemale, faMale } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { connect } from 'react-redux';
import './CompanyInfo.css';
import { Props } from '../../define/model';
import { Grid, Paper } from '@material-ui/core';
import MenuButtonGroupForCompanyInfo from './MenuButtonGroupForCompanyInfo';

// あらかじめ使用するアイコンを追加しておく
library.add(faDoorOpen, faDoorClosed, faMale, faFemale);

class CompanyInfo extends React.Component<Props, any> {
  render() {
    const companyInfo = this.props.state.companyInfoState;
    const DECIMAL_POINT = 1;

    return (
      <div className='office_info'>
        <h4 style={{ textAlign: 'center' }}>執務室</h4>
        <Grid container justify='center' alignItems='center' spacing={3} className='info'>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              気温
              <div className='info_content'>
                {companyInfo.officeInfo.tempreture === null ? '-' : companyInfo.officeInfo.tempreture.toFixed(DECIMAL_POINT)}
                <span className='info_content_unit'>℃</span>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              湿度
              <div className='info_content'>
                {companyInfo.officeInfo.humidity === null ? '-' : companyInfo.officeInfo.humidity.toFixed(DECIMAL_POINT)}
                <span className='info_content_unit'>%</span>
              </div>
            </Paper>
          </Grid>
        </Grid>
        <h4 style={{ textAlign: 'center' }}>トイレ使用状況</h4>
        <Grid container justify='center' alignItems='center' spacing={3}>
          <Grid item xs={4}>
            <Paper className='paper restroom_no_operating' elevation={2}>
              <FontAwesomeIcon icon='female' style={{ color: 'red' }} /> 女性
              <div className='restrooms_content_no_operating'>&nbsp;</div>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className='paper' elevation={2}>
              <FontAwesomeIcon icon='male' style={{ color: 'blue' }} /> 男性(個室)
              {companyInfo.restrooms.isNoVacancyForMen === null && <div className='restrooms_content_no_operating'>-</div>}
              {companyInfo.restrooms.isNoVacancyForMen === true && (
                <div className='restrooms_content_no_vacancy'>
                  <FontAwesomeIcon icon='door-closed' /> 満室
                </div>
              )}
              {companyInfo.restrooms.isNoVacancyForMen === false && (
                <div className='restrooms_content_vacancy'>
                  <FontAwesomeIcon icon='door-open' /> 空室
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>
        <MenuButtonGroupForCompanyInfo />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(CompanyInfo);
