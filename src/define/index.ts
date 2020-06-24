/* eslint-disable no-magic-numbers */

// TypeError: fs.existsSync is not a function が発生する問題の対処
const { remote } = window.require('electron');

// ユーザの状態及び、表示文字色を定義したクラス
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

// public/electron.js のグローバル変数からアプリケーション名を取得
export const APP_NAME: string = remote.getGlobal('description') || '';

// public/electron.js のグローバル変数からメインプロセスのバージョンを取得
export const MAIN_APP_VERSION: string = remote.getGlobal('appVersion') || '';

// .env ファイルからレンダラープロセスのバージョンを取得
export const RENDERER_APP_VERSION: string = process.env.REACT_APP_VERSION || '';

// .env ファイルからAPIのURLを取得
export const API_URL: string = process.env.REACT_APP_API_URL || '';

// .env ファイルからAPIの認証情報を取得
export const LOGIN_USER = {
  username: process.env.REACT_APP_USERNAME || '',
  password: process.env.REACT_APP_PASSWORD || '',
};

// .env ファイルからElectronアプリケーションのダウンロードURLを所得
export const APP_DOWNLOAD_URL: string = process.env.REACT_APP_DOWNLOAD_URL || '';

// .env ファイルからGoogleカレンダーのベースURLを取得
export const CALENDAR_URL: string = process.env.REACT_APP_CALENDAR_URL || '';

// .env ファイルから設定画面で表示される、メールアドレスのドメイン名
export const EMAIL_DOMAIN: string = process.env.REACT_APP_EMAIL_DOMAIN || '';

// APIリクエストヘッダを定義
export const REQUEST_HEADERS = {
  'Content-type': 'application/json; charset=UTF-8',
};

// アプリ内でユーザが存在しない状態を定義
export const NO_USER = -1;

// ユーザ一覧に自分の情報が存在しない状態を定義
export const NO_USER_IN_USERLIST = 0;

// ユーザの状態及び、表示文字色を定義したクラスをインスタンス化
export const USER_STATUS_INFO: UserStatusInfo = new UserStatusInfo();

// ユーザの状態のみを抽出した配列を定義
export const STATUS_LIST: string[] = Object.entries(USER_STATUS_INFO).map(
  ([, value]: [string, { status: string; color: string }]) => {
    return value.status;
  }
);

// トイレの満席状態を定義
export const NO_VACANT = 0;

/**
 * 各ユーザを退社と見なす時間（分）
 * 10の場合、ユーザの最新のヘルスチェック受信時刻が10分以上前だった場合は退社と見なされる
 */
export const LEAVING_TIME_THRESHOLD_M: number = 10;

// APIサーバにヘルスチェックを送信する時間間隔
export const HEALTH_CHECK_INTERVAL_MS: number = 60000 * 4 + 1000 * 30;

// バージョンチェックAPIをリクエストする時間間隔
export const VERSION_CHECK_INTERVAL_MS: number = 60000 * 30 + 1000 * 0;

// APIリクエストの最低待ち時間
export const API_REQUEST_LOWEST_WAIT_TIME_MS = 350;

// snackbarの表示時間
export const SNACKBAR_DISPLAY_DEFAULT_TIME_MS = 5000;

// ElectronAPIのダイアログにて、OKを選択した際の内部番号
export const BUTTON_CLICK_OK = 0;

// アプリ内のタブの内部番号を定義
export enum AppTabIndex {
  userInfo,
  companyInfo,
  settings,
}

// HTTPリクエストのステータスコードを定義
export enum ResponseStatusCode {
  unauthorized = 401,
}
