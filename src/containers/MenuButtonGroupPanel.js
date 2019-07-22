import { connect } from 'react-redux';
import MenuButtonGroup from '../components/MenuButtonGroup';

function mapStateToProps(state) {
  return {
    state
  };
}

export default connect(mapStateToProps)(MenuButtonGroup);
