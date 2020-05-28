import { API_URL, AUTH_REQUEST_HEADERS, LOGIN_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfo } from '../define/model';

export const appAPI = {
  login: async () => {
    return await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: LOGIN_REQUEST_HEADERS,
      body: JSON.stringify(LOGIN_USER),
    });
  },

  getAppInfo: async () => {
    return await fetch(`${API_URL}/appInfo`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
  },

  sendHealthCheck: async (userInfo: UserInfo, userId: number) => {
    return await fetch(`${API_URL}/userList/${userId}`, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(userInfo),
    });
  },
};
