import React from 'react';
import './Settings.css';
import store from '../store/configureStore';
import { Col, Row, Form, ListGroup } from 'react-bootstrap';
import Switch from '@material/react-switch';
import MaterialButton from '@material/react-button';
import { UserInfo } from '../define/model';

class Settings extends React.Component<any, any> {
  user = {
    userID: -1
  };

  constructor(props: any) {
    super(props);
    this.state = {
      submitButtonStatus: false,
      checked: {
        startup: false
      }
    };
  }

  settings: any = store.getState().settingsState;

  onSystemInputChange = (event: any) => {
    this.settings.system[event.currentTarget.name] = event.currentTarget.value;
  };

  onUserChange = (event: any) => {
    this.user.userID = parseInt(event.target.value);
    if (this.props.submitButtonStatus) {
      this.setState({ submitButtonStatus: true });
    }
  };

  render() {
    const changeUserList = store.getState().userListState['changeUserList'];

    return (
      <div className='settings'>
        <Row className='setting_user'>
          <Col md='2' />
          <Col md='8'>
            <h4>ユーザ</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>ユーザ変更</Form.Label>
                    <Form.Control name='user-change' as='select' onChange={this.onUserChange}>
                      <option hidden>選択してください</option>
                      {changeUserList
                        .sort((a: UserInfo, b: UserInfo) => {
                          return a.order - b.order;
                        })
                        .map((userInfo: UserInfo, index: number) => (
                          <option key={index} value={userInfo['id']}>
                            {userInfo['name']}
                          </option>
                        ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group as={Col} />
                </Form.Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>メールアドレス</Form.Label>
                    <p>
                      <small className='text-muted'>社員情報からGoogleカレンダーを表示する事ができます。</small>
                    </p>
                    <div className='form-inline'>
                      <Form.Control
                        name='email'
                        placeholder=''
                        defaultValue={this.settings.system.email}
                        onChange={this.onSystemInputChange}
                        maxLength={100}
                      />
                      @townsystem.co.jp
                    </div>
                  </Form.Group>
                </Form.Row>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
        <Row className='setting_system'>
          <Col md='2' />
          <Col md='8'>
            <h4>システム</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col} controlId='startup'>
                    <Form.Label>スタートアップ</Form.Label>
                    <p>
                      <small className='text-muted'>有効にすると、PC起動時に自動的に行き先掲示板が起動します。</small>
                    </p>
                    <Switch
                      checked={this.state.checked.startup}
                      onChange={(e: any) => this.setState({ checked: e.target.checked })}
                    />
                  </Form.Group>
                </Form.Row>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md='2' />
        </Row>
        <MaterialButton outlined type='button' className='modal-button button-submit button-save'>
          保存
        </MaterialButton>
      </div>
    );
  }
}

export default Settings;
