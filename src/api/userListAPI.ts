import { API_URL, REQUEST_HEADERS } from '../define';
import { UserInfo, UserInfoForUpdate } from '../define/model';
import { getAuthorizationHeader } from '../components/common/utils';

export const UserListAPI = {
  deleteUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/userList/${userId}`, {
      method: 'DELETE',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
    return response;
  },

  addUser: async (userInfo: UserInfo) => {
    const response = await fetch(`${API_URL}/userList`, {
      method: 'POST',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },

  getUserList: async () => {
    const response = await fetch(`${API_URL}/userList`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
    return response;
  },

  updateUserInfo: async (userInfo: UserInfoForUpdate, userId: number) => {
    const response = await fetch(`${API_URL}/userList/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },

  updateHealthCheck: async (userInfo: UserInfoForUpdate, userId: number) => {
    const response = await fetch(`${API_URL}/healthCheck/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },

  updateAppVersion: async (userInfo: UserInfoForUpdate, userId: number) => {
    const response = await fetch(`${API_URL}/updateAppVersion/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },

  changeOrder: async (userInfo: UserInfoForUpdate, userId: number) => {
    const response = await fetch(`${API_URL}/changeOrder/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
    return response;
  },
};
