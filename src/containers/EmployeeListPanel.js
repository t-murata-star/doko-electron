import { connect } from 'react-redux';
import EmployeeList from '../components/EmployeeList';

function mapStateToProps(state) {
  const { employeeList, isFetching, isError } = state.employeeList;
  return {
    employeeList,
    isFetching,
    isError
  };
}

export default connect(mapStateToProps)(EmployeeList);
