import { API_URL, REQUEST_HEADERS, LOGIN_USER } from '../define';
import { UserInfoForUpdate } from '../define/model';
import { getAuthorizationHeader } from '../components/common/utils';

export const appAPI = {
  login: async () => {
    return await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: new Headers({ ...REQUEST_HEADERS }),
      body: JSON.stringify(LOGIN_USER),
    });
  },

  getAppInfo: async () => {
    return await fetch(`${API_URL}/appInfo`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
  },

  sendHealthCheck: async (userInfo: UserInfoForUpdate, userId: number) => {
    return await fetch(`${API_URL}/userList/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
  },
};
