import { API_URL, AUTH_REQUEST_HEADERS, LOGIN_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfo } from '../define/model';

export class AppAPI {
  static login = async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: LOGIN_REQUEST_HEADERS,
      body: JSON.stringify(LOGIN_USER),
    });
    return response;
  };

  static getNotification = async () => {
    const response = await fetch(`${API_URL}/notification`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
    return response;
  };

  static sendHealthCheck = async (userInfo: UserInfo, userID: number) => {
    const body = { ...userInfo };
    const response = await fetch(`${API_URL}/userList/${userID}`, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(body),
    });
    return response;
  };
}
