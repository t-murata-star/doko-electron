import { connect } from 'react-redux';
import InitialStartupModal from '../components/InitialStartupModal';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(InitialStartupModal);
