import { RootState } from '../modules';

/**
 * 型定義として用いる
 */

export type Props = {
  state: RootState;
  dispatch: any;
};

export class ApiResponse {
  constructor(public payload: any, public isError: boolean) {}

  getPayload() {
    return this.payload;
  }
  getIsError() {
    return this.isError;
  }
}

export interface UserInfoForUpdate {
  id?: number;
  order?: number;
  name?: string;
  status?: string;
  destination?: string;
  return?: string;
  updatedAt?: string;
  message?: string;
  version?: string;
  email?: string;
  healthCheckAt?: string;
}

export class UserInfo {
  id: number = -1;
  order: number = -1;
  name: string = '';
  status: string = '';
  destination: string = '';
  return: string = '';
  updatedAt: string = '';
  message: string = '';
  version: string = '';
  email: string = '';
  healthCheckAt: string = '';
}

export class UserStatusInfo {
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

export class AppInfo {
  content: string = '';
  latestAppVersion: string = '';
}

export class Restroom {
  id: number = -1;
  gender: string = '';
  place: string = '';
  isUsing: boolean = false;
}

export class Info {
  tempreture: number = -1;
  humidity: number = -1;
}
