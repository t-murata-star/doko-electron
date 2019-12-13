import { connect } from 'react-redux';
import MenuButtonGroupForUserList from '../../components/userInfo/MenuButtonGroupForUserList';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(MenuButtonGroupForUserList);
