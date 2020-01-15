import React from 'react';
import './Inoperable.css';

type ContentProps = {
  enabled: boolean;
};

const Inoperable: React.FC<ContentProps> = props => {
  if (props.enabled) {
    return <div className='inoperable' />;
  } else {
    return null;
  }
};

export default Inoperable;
