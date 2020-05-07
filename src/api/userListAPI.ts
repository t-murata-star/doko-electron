import { API_URL, AUTH_REQUEST_HEADERS } from '../define';
import { UserInfo, UserInfoForUpdate } from '../define/model';

export const UserListAPI = {
  deleteUser: async (userID: number) => {
    return await fetch(`${API_URL}/userList/${userID}`, {
      method: 'DELETE',
      headers: AUTH_REQUEST_HEADERS,
    });
  },

  addUser: async (userInfo: UserInfo) => {
    return await fetch(`${API_URL}/userList`, {
      method: 'POST',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(userInfo),
    });
  },

  getUserList: async () => {
    return await fetch(`${API_URL}/userList`, {
      method: 'GET',
      headers: AUTH_REQUEST_HEADERS,
    });
  },

  updateUserInfo: async (userInfo: UserInfoForUpdate, userID: number) => {
    return await fetch(`${API_URL}/userList/${userID}`, {
      method: 'PATCH',
      headers: AUTH_REQUEST_HEADERS,
      body: JSON.stringify(userInfo),
    });
  },
};