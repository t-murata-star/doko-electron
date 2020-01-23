import React from 'react';
import './Inoperable.css';

type ContentProps = {
  enabled: boolean;
};

const MemoComponent = (props: ContentProps) => {
  if (props.enabled) {
    return <div className='inoperable' />;
  } else {
    return null;
  }
};

const Inoperable = React.memo(MemoComponent);

export default Inoperable;
