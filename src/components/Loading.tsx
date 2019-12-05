import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import './Loading.css';

library.add(faSpinner); //あらかじめ使用するアイコンを追加しておく

// ローディングインジケータ
class Loading extends React.Component<any, any> {
  render() {
    if (this.props.state.userListState.isFetching || this.props.state.officeInfoState.isFetching) {
      return (
        <div className='mx-auto'>
          <div className='background'></div>
          <table className='loading'>
            <tbody>
              <tr>
                <th>
                  通信中 <FontAwesomeIcon icon='spinner' spin />
                </th>
              </tr>
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
