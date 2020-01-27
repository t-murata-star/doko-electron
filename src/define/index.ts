import { UserStatus } from './model';

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
export const USER_STATUS: UserStatus = new UserStatus();
export const STATUS_LIST: string[] = [
  USER_STATUS.s01,
  USER_STATUS.s02,
  USER_STATUS.s03,
  USER_STATUS.s04,
  USER_STATUS.s05,
  USER_STATUS.s06,
  USER_STATUS.s07,
  USER_STATUS.s08,
  USER_STATUS.s09,
  USER_STATUS.s10,
  USER_STATUS.s11,
  USER_STATUS.s12,
  USER_STATUS.s13
];
export const HEARTBEAT_INTERVAL_MS: number = parseInt(process.env.REACT_APP_HEARTBEAT_INTERVAL_MS || '270000');
export const LEAVING_TIME_THRESHOLD_M: number = parseInt(process.env.REACT_APP_LEAVING_TIME_THRESHOLD_M || '10');
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';

export const SAVE_INSTALLER_FILENAME: string = 'doco_electron_update_installer';
