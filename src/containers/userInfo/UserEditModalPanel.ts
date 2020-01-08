import { connect } from 'react-redux';
import UserEditModal from '../../components/userInfo/UserEditModal';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserEditModal);
