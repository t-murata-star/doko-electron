import { API_URL, REQUEST_HEADERS } from '../define';
import { getAuthorizationHeader } from '../components/common/utils';

export const officeInfoAPI = {
  getRestroomUsage: async () => {
    return await fetch(`${API_URL}/restrooms`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
  },

  getOfficeInfo: async () => {
    return await fetch(`${API_URL}/officeInfo`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
  },
};
