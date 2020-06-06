/* eslint-disable no-magic-numbers */
const { remote } = window.require('electron');

class UserStatusInfo {
  s01 = { status: '在席', color: '#333333' };
  s02 = { status: '退社', color: '#0000FF' };
  s03 = { status: '年休', color: '#FF0000' };
  s04 = { status: 'AM半休', color: '#00A900' };
  s05 = { status: 'PM半休', color: '#FF0000' };
  s06 = { status: 'FLEX', color: '#00A900' };
  s07 = { status: '出張', color: '#0000FF' };
  s08 = { status: '外出', color: '#0000FF' };
  s09 = { status: '本社外勤務', color: '#0000FF' };
  s10 = { status: '遅刻', color: '#00A900' };
  s11 = { status: '行方不明', color: '#FF0000' };
  s12 = { status: '接客中', color: '#00A900' };
  s13 = { status: '在席 (離席中)', color: '#333333' };
}

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
export const NO_USER = -1;
export const NO_USER_IN_USERLIST = 0;
export const USER_STATUS_INFO: UserStatusInfo = new UserStatusInfo();
export const STATUS_LIST: string[] = Object.entries(USER_STATUS_INFO).map(
  ([, value]: [string, { status: string; color: string }]) => {
    return value.status;
  }
);
export const NO_VACANT = 0;
export const LEAVING_TIME_THRESHOLD_M: number = 10;
export const HEALTH_CHECK_INTERVAL_MS: number = 60000 * 4 + 1000 * 30;
export const VERSION_CHECK_INTERVAL_MS: number = 60000 * 30 + 1000 * 0;
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';
export const API_REQUEST_LOWEST_WAIT_TIME_MS = 350;
export const SNACKBAR_DISPLAY_DEFAULT_TIME_MS = 5000;
export const BUTTON_CLICK_OK = 0;
export enum AppTabIndex {
  userInfo,
  companyInfo,
  settings,
}
export enum ResponseStatusCode {
  unauthorized = 401,
}
