import { connect } from 'react-redux';
import MenuButtonGroupForOfficeInfo from '../components/MenuButtonGroupForOfficeInfo';

function mapStateToProps(state: any) {
  return {
    state
  };
}

export default connect(mapStateToProps)(MenuButtonGroupForOfficeInfo);
