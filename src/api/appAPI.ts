import { API_URL, AUTH_REQUEST_HEADERS, LOGIN_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfo } from '../define/model';

export class AppAPI {
  static login = async () => {
    return await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: LOGIN_REQUEST_HEADERS,
      body: JSON.stringify(LOGIN_USER),
    });
  };

  static getNotification = async () => {
    return await fetch(`${API_URL}/notification`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
  };

  static sendHealthCheck = async (userInfo: UserInfo, userID: number) => {
    return await fetch(`${API_URL}/userList/${userID}`, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(userInfo),
    });
  };
}
