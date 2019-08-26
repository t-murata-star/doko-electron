import React, { Component } from 'react';
import './Loading.css';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

library.add(faSpinner) //あらかじめ使用するアイコンを追加しておく

// ローディングインジケータ
class Loading extends Component {
  render() {
    if (this.props.isFetching) {
      return (
        <div className='mx-auto'>
          <table className='loading'>
            <tbody>
              <tr><th>通信中 <FontAwesomeIcon icon='spinner' spin /></th></tr>
            </tbody>
          </table>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Loading;
