import { connect } from 'react-redux';
import InitialStartupModal from '../components/userInfo/InitialStartupModal';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(InitialStartupModal);
