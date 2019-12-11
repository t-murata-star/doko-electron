import React from 'react';
import './Progress.css';

// ローディングインジケータ
class Progress extends React.Component<any, any> {
  render() {
    if (this.props.isUpdating) {
      return (
        <div className='mx-auto'>
          <div className='update-progress-background'></div>
          <div className='update-progress'>ダウンロード中.. {this.props.progress}%</div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Progress;
