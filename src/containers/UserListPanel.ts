import { connect } from 'react-redux';
import UserList from '../components/UserList';

function mapStateToProps(state: any) {
  const { userList, isFetching, isError } = state.userListState;
  return {
    userList,
    isFetching,
    isError
  };
}

export default connect(mapStateToProps)(UserList);
