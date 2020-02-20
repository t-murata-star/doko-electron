import { UserStatusInfo } from './model';

const { remote } = window.require('electron');

export const APP_NAME: string = remote.getGlobal('description') || '';
export const APP_VERSION: string = remote.getGlobal('appVersion') || '';
export const API_URL: string = process.env.REACT_APP_API_URL || '';
export const LOGIN_USER: any = {
  username: process.env.REACT_APP_USERNAME || '',
  password: process.env.REACT_APP_PASSWORD || ''
};
export const APP_DOWNLOAD_URL: string = process.env.REACT_APP_DOWNLOAD_URL || '';
export const LOGIN_REQUEST_HEADERS: any = {
  'Content-type': 'application/json; charset=UTF-8'
};
export const AUTH_REQUEST_HEADERS: any = {
  'Content-type': 'application/json; charset=UTF-8',
  Authorization: ''
};
export const USER_STATUS_INFO: UserStatusInfo = new UserStatusInfo();
export const STATUS_LIST: string[] = Object.entries(USER_STATUS_INFO).map(
  ([, value]: [string, { status: string; color: string }]) => {
    return value.status;
  }
);
export const HEALTH_CHECK_INTERVAL_MS: number = parseInt(process.env.REACT_APP_HEALTH_CHECK_INTERVAL_MS || '270000');
export const LEAVING_TIME_THRESHOLD_M: number = parseInt(process.env.REACT_APP_LEAVING_TIME_THRESHOLD_M || '10');
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';
