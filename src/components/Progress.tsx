import React from 'react';
import './Progress.css';

type ContentProps = {
  isUpdating: boolean;
  downloadProgress: number;
};

const Progress: React.FC<ContentProps> = props => {
  if (props.isUpdating) {
    return (
      <div className='mx-auto'>
        <div className='update-progress-background'></div>
        <div className='update-progress'>ダウンロード中.. {props.downloadProgress}%</div>
      </div>
    );
  } else {
    return null;
  }
};

export default Progress;
