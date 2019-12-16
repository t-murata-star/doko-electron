import { connect } from 'react-redux';
import App from '../components/App';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(App);
