import { API_URL, REQUEST_HEADERS } from '../define';
import { UserInfo, UserInfoForUpdate } from '../define/model';
import { getAuthorizationHeader } from '../components/common/utils';

export const UserListAPI = {
  deleteUser: async (userId: number) => {
    return await fetch(`${API_URL}/userList/${userId}`, {
      method: 'DELETE',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
  },

  addUser: async (userInfo: UserInfo) => {
    return await fetch(`${API_URL}/userList`, {
      method: 'POST',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
  },

  getUserList: async () => {
    return await fetch(`${API_URL}/userList`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
  },

  updateUserInfo: async (userInfo: UserInfoForUpdate, userId: number) => {
    return await fetch(`${API_URL}/userList/${userId}`, {
      method: 'PATCH',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
      body: JSON.stringify(userInfo),
    });
  },
};
