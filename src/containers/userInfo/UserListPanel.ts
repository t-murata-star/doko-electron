import { connect } from 'react-redux';
import UserList from '../../components/userInfo/UserList';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(UserList);
