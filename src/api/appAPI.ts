import { API_URL, REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfoForUpdate } from '../define/model';
import { getAuthorizationHeader } from '../components/common/utils';

export const appAPI = {
  login: async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: new Headers({ ...REQUEST_HEADERS }),
      body: JSON.stringify(LOGIN_USER),
    });
    return response;
  },

  getAppInfo: async () => {
    const response = await fetch(`${API_URL}/appInfo`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
    return response;
  },

  sendHealthCheck: async (userInfo: UserInfoForUpdate, userId: number) => {
    const response = await fetch(`${API_URL}/userList/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },
};
