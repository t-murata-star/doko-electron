import packageJson from '../../package.json';

export const APP_NAME: string = packageJson.description || '';
export const APP_VERSION: string = packageJson.version || '';
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
  'Authorization': ''
};
export const STATUS_LIST: string[] = [
  '在席',
  '退社',
  '年休',
  'AM半休',
  'PM半休',
  'FLEX',
  '出張',
  '外出',
  '本社外勤務',
  '行方不明',
  '遅刻',
  '接客中',
  '在席 (離席中)'
];

export const HEARTBEAT_INTERVAL_MS: number = parseInt(process.env.REACT_APP_HEARTBEAT_INTERVAL_MS || '270000');
export const LEAVING_TIME_THRESHOLD_M: number = parseInt(process.env.REACT_APP_LEAVING_TIME_THRESHOLD_M || '10');
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';
