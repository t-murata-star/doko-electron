import { connect } from 'react-redux';
import App from '../components/userInfo/App';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(App);
