export const API_URL: string = process.env.REACT_APP_API_URL || '';
export const LOGIN_USER: any = {
  username: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD
};
export const APP_DOWNLOAD_URL: string = process.env.REACT_APP_DOWNLOAD_URL || '';
export const LOGIN_REQUEST_HEADERS: any = {
  'Content-type': 'application/json; charset=UTF-8'
};
export const AUTH_REQUEST_HEADERS: any = {
  'Content-type': 'application/json; charset=UTF-8',
  'Authorization': ''
};
export const TABLE_COLUMNS: any[] = [
  { rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 25, minWidth: 25, resizable: false },
  { title: '順序', field: 'order', visible: false, headerSort: false, sorter: 'number' },
  { title: '氏名', field: 'name', width: 150, headerSort: false },
  { title: '状態', field: 'status', width: 100, headerSort: false },
  { title: '行き先', field: 'destination', width: 300, headerSort: false },
  { title: '戻り', field: 'return', width: 140, headerSort: false },
  {
    title: '更新日時',
    field: 'updatedAt',
    width: 90,
    headerSort: false,
    sorter: 'datetime',
    sorterParams: { format: 'YYYY-MM-DD hh:mm:ss.SSS' },
    formatter: 'datetime',
    formatterParams: {
      outputFormat: 'YYYY/MM/DD',
      invalidPlaceholder: ''
    }
  },
  { title: 'メッセージ', field: 'message', headerSort: false }
];
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
