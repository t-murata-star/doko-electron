import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faPowerOff, faSync, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import React from 'react';
import { connect } from 'react-redux';
import './MenuButtonGroupForCompanyInfo.css';
import { Props } from '../../define/model';
import { companyInfoActionsAsyncLogic } from '../../actions/companyInfo/companyInfoActions';

// あらかじめ使用するアイコンを追加しておく
library.add(faPowerOff, faSync, faEdit, faWindowMinimize);

class MenuButtonGroupForCompanyInfo extends React.Component<Props, any> {
  reload = () => {
    const { dispatch } = this.props;
    dispatch(companyInfoActionsAsyncLogic.getAllCompanyInfo());
  };

  render() {
    const isShowLoadingPopup = this.props.state.appState.isShowLoadingPopup;

    return (
      <div className='menu-button-group-for-office-info'>
        <Button
          variant='outlined'
          color='default'
          onClick={this.reload}
          disabled={isShowLoadingPopup === true}
          fullWidth
          style={{ boxShadow: 'none' }}
          className='base-btn-outline'>
          <FontAwesomeIcon icon='sync' />
          &nbsp;再読込
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(MenuButtonGroupForCompanyInfo);
