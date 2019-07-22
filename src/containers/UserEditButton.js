import { connect } from 'react-redux';
import UserEditButton from '../components/UserEdit';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserEditButton);
