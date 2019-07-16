import React, { Component } from 'react';
import './App.css';
import EmployeeList from '../containers/EmployeeListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'

class App extends Component {
  render() {
    return (
      <div>
        <EmployeeList />
        <MenuButtonGroup />
      </div>
    );
  }
}

export default App;
