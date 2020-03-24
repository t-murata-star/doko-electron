import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faPowerOff, faSync, faWindowMinimize } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import React from 'react';
import { connect } from 'react-redux';
import { AsyncActionsOfficeInfo } from '../../modules/officeInfo/officeInfoModule';
import './MenuButtonGroupForOfficeInfo.css';
import { Props } from '../../define/model';

library.add(faPowerOff, faSync, faEdit, faWindowMinimize); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForOfficeInfo extends React.Component<Props, any> {
  reload = async () => {
    const { dispatch } = this.props;
    await dispatch(AsyncActionsOfficeInfo.getRestroomUsageAction(350));
  };

  render() {
    const officeInfo = this.props.state.officeInfoState;

    return (
      <div className='menu-button-group-for-office-info'>
        <Button
          variant='outlined'
          color='default'
          onClick={this.reload}
          disabled={officeInfo.isFetching === true}
          fullWidth
          style={{ boxShadow: 'none' }}>
          <FontAwesomeIcon icon='sync' />
          &nbsp;再読込
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(MenuButtonGroupForOfficeInfo);
