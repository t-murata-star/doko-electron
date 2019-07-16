import { connect } from 'react-redux';
import MenuButtonGroup from '../components/MenuButtonGroup';

function mapStateToProps(state) {
  const { MenuButtonGroup } = state;
  return {
    MenuButtonGroup
  };
}

export default connect(mapStateToProps)(MenuButtonGroup);
