import { connect } from 'react-redux';
import OfficeInfo from '../components/OfficeInfo';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(OfficeInfo);
