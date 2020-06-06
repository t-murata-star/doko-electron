import { API_URL, REQUEST_HEADERS } from '../define';
import { getAuthorizationHeader } from '../components/common/utils';

export const companyInfoAPI = {
  getRestroomUsage: async () => {
    const response = await fetch(`${API_URL}/restrooms`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
    return response;
  },

  getOfficeInfo: async () => {
    const response = await fetch(`${API_URL}/officeInfo`, {
      method: 'GET',
      headers: new Headers({ ...REQUEST_HEADERS, ...getAuthorizationHeader() }),
    });
    return response;
  },
};
