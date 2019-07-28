import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading'
import store from '../store/configureStore';

const Store = window.require('electron-store');
const electronStore = new Store();

class App extends Component {
  componentDidMount() {
    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (!electronStore.get('userID')) {
      this._showModal();
    }
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  }

  render() {
    const isFetching = store.getState().userList.isFetching

    return (
      <div>
        {electronStore.get('userID') &&
          <div>
            <UserList />
            <MenuButtonGroup />
          </div>
        }
        <InitialStartupModal />
        <Loading isFetching={isFetching} />
      </div>
    );
  }
}

export default App;
