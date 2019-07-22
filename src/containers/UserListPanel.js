import { connect } from 'react-redux';
import EmployeeList from '../components/UserList';

function mapStateToProps(state) {
  const { employeeList, isFetching, isError } = state.employeeList;
  return {
    employeeList,
    isFetching,
    isError
  };
}

export default connect(mapStateToProps)(EmployeeList);
