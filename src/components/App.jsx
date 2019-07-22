import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'

class App extends Component {
  render() {
    return (
      <div>
        <UserList />
        <MenuButtonGroup />
      </div>
    );
  }
}

export default App;
