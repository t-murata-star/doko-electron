import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './Loading.css';

library.add(faSpinner); //あらかじめ使用するアイコンを追加しておく

// ローディングインジケータ
class Loading extends React.Component<any, any> {
  render() {
    if (
      this.props.state.appState.isProcessing ||
      this.props.state.userListState.isFetching ||
      this.props.state.officeInfoState.isFetching
    ) {
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
  }
}

export default Loading;
