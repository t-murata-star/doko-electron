import { API_URL, REQUEST_HEADERS, LOGIN_USER } from '../define';
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
};
