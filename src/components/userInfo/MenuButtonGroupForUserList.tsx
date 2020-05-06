import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import $ from 'jquery';
import React from 'react';
import { connect } from 'react-redux';
import { menuButtonGroupForUserListActionsAsyncLogic } from '../../actions/userInfo/menuButtonGroupForUserListActions';
import { getUserInfo } from '../common/utils';
import './MenuButtonGroupForUserList.css';
import UserEditModal from './UserEditModal';
import { Props } from '../../define/model';
import { Grid } from '@material-ui/core';
import { userEditModalActions } from '../../actions/userInfo/userEditModalActions';
library.add(faSync, faEdit); //あらかじめ使用するアイコンを追加しておく

class MenuButtonGroupForUserList extends React.Component<Props, any> {
  reload = async () => {
    const { dispatch } = this.props;
    dispatch(menuButtonGroupForUserListActionsAsyncLogic.reload());
  };

  showUserEditModal = () => {
    const { dispatch } = this.props;
    const userList = this.props.state.userListState.userList;
    const myUserID = this.props.state.appState.myUserID;
    const userInfo = getUserInfo(userList, myUserID);

    if (userInfo === null) {
      return;
    }

    dispatch(userEditModalActions.setUserInfo(userInfo));
    dispatch(userEditModalActions.disableSubmitButton());
    dispatch(userEditModalActions.showUserEditModal(myUserID));
    // 自分編集ボタンのフォーカスを外す
    $('.menu-button-group-for-user-list-base-button').blur();
  };

  render() {
    const userList = this.props.state.userListState.userList;
    const appState = this.props.state.appState;
    const myUserID = appState.myUserID;
    const userInfo = getUserInfo(userList, myUserID);
    const isFetching = this.props.state.appState.isFetching;

    return (
      <div className='menu-button-group-for-user-list'>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant='outlined'
              color='default'
              onClick={this.reload}
              disabled={isFetching === true}
              fullWidth
              style={{ boxShadow: 'none' }}>
              <FontAwesomeIcon icon='sync' />
              &nbsp;再読込
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant='outlined'
              color='default'
              onClick={this.showUserEditModal}
              disabled={userInfo === null || appState.isAuthenticated === false}
              fullWidth
              style={{ boxShadow: 'none' }}>
              <FontAwesomeIcon icon='edit' />
              &nbsp;自分編集
            </Button>
          </Grid>
        </Grid>
        <UserEditModal />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(MenuButtonGroupForUserList);
