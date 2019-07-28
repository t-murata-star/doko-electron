import { connect } from 'react-redux';
import UserEditModal from '../components/UserEditModal';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserEditModal);
