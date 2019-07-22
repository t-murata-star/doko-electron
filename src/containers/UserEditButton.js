import { connect } from 'react-redux';
import UserEditButton from '../components/UserEditButton';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserEditButton);
