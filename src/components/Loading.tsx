import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './Loading.css';

library.add(faSpinner); //あらかじめ使用するアイコンを追加しておく

type ContentProps = {
  isAppStateProcessing: boolean;
  isUserListProcessing: boolean;
  officeInfoProcessing: boolean;
};

// ローディングインジケータ
const Loading: React.FC<ContentProps> = props => {
  if (props.isAppStateProcessing || props.isUserListProcessing || props.officeInfoProcessing) {
    return (
      <div className='mx-auto'>
        <div className='loading-background'></div>
        <div className='loading'>
          通信中 <FontAwesomeIcon icon='spinner' spin />
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Loading;
