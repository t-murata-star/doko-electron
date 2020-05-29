import { UserStatusInfo } from './model';
const { remote } = window.require('electron');

export const APP_NAME: string = remote.getGlobal('description') || '';
export const MAIN_APP_VERSION: string = remote.getGlobal('appVersion') || '';
export const RENDERER_APP_VERSION: string = process.env.REACT_APP_VERSION || '';
export const API_URL: string = process.env.REACT_APP_API_URL || '';
export const LOGIN_USER = {
  username: process.env.REACT_APP_USERNAME || '',
  password: process.env.REACT_APP_PASSWORD || '',
};
export const APP_DOWNLOAD_URL: string = process.env.REACT_APP_DOWNLOAD_URL || '';
export const REQUEST_HEADERS = {
  'Content-type': 'application/json; charset=UTF-8',
};
export const USER_STATUS_INFO: UserStatusInfo = new UserStatusInfo();
export const STATUS_LIST: string[] = Object.entries(USER_STATUS_INFO).map(
  ([, value]: [string, { status: string; color: string }]) => {
    return value.status;
  }
);
export const LEAVING_TIME_THRESHOLD_M: number = 10;
export const HEALTH_CHECK_INTERVAL_MS: number = 60000 * 4 + 1000 * 30;
export const VERSION_CHECK_INTERVAL_MS: number = 60000 * 30 + 1000 * 0;
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';
export const API_REQUEST_LOWEST_WAIT_TIME_MS = 350;
