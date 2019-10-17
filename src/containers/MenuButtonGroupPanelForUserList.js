import { connect } from 'react-redux';
import MenuButtonGroupForUserList from '../components/MenuButtonGroupForUserList';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(MenuButtonGroupForUserList);
