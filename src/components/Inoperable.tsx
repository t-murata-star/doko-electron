import React from 'react';
import './Inoperable.css';

class Inoperable extends React.Component<any, any> {
  render() {
    if (this.props.enabled) {
      return <div className='inoperable' />;
    } else {
      return null;
    }
  }
}

export default Inoperable;
