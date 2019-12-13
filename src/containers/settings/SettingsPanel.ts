import { connect } from 'react-redux';
import Settings from '../../components/settings/Settings';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(Settings);
