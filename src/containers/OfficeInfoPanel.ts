import { connect } from 'react-redux';
import OfficeInfo from '../components/OfficeInfo';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(OfficeInfo);
