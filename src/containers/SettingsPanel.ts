import { connect } from 'react-redux';
import Settings from '../components/Settings';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(Settings);
