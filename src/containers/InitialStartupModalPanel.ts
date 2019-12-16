import { connect } from 'react-redux';
import InitialStartupModal from '../components/InitialStartupModal';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(InitialStartupModal);
