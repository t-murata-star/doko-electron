import React from 'react';
import './Settings.css';
import store from '../store/configureStore';
import { Col, Row, Form, ListGroup } from 'react-bootstrap';
import Switch from '@material/react-switch';

class Settings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      checked: {
        startup: false
      }
    };
  }

  settings: any = store.getState().settingsState;

  onSystemInputChange = (event: any) => {
    this.settings.system[event.currentTarget.name] = event.currentTarget.value;
  };

  render() {
    return (
      <div className='settings'>
        <Row className='setting_user'>
          <Col md='2' />
          <Col md='8'>
            <h4>ユーザ</h4>
            <ListGroup>
              <ListGroup.Item>
                <Form.Row>
                  <Form.Group as={Col} controlId='email'>
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
                  <Form.Group as={Col} controlId='email'>
                    <Form.Label>スタートアップ</Form.Label>
                    <p>
                      <small className='text-muted'>有効にすると、PC起動時に自動的に行き先掲示板が起動します。</small>
                    </p>
                    <Switch
                      nativeControlId='my-switch'
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
      </div>
    );
  }
}

export default Settings;
