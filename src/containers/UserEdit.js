import { connect } from 'react-redux';
import UserEdit from '../components/UserEdit';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserEdit);
