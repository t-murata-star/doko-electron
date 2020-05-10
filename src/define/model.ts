import { RootState } from '../modules';

/**
 * プロジェクト内独自の型定義
 */

export type Props = {
  state: RootState;
  dispatch: any;
};

export class ApiResponse<T> {
  constructor(public payload: T, public isError: boolean) {}

  getPayload() {
    return this.payload;
  }
  getIsError() {
    return this.isError;
  }
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

/**
 * DBの型定義
 */

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

export class OfficeInfo {
  tempreture: number = -1;
  humidity: number = -1;
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

// APIレスポンスの型定義
export interface Login {
  token: string;
}

export interface GetAppInfo extends AppInfo {}

export interface SendHealthCheck extends UserInfo {}

export interface GetRestroomUsage extends Restroom {}

export interface GetOfficeInfo extends OfficeInfo {}

export interface DeleteUser {}

export interface AddUser extends UserInfo {}

export interface GetUserList extends UserInfo {}

export interface GetUserListWithMyUserIDExists extends UserInfo {}

export interface UpdateUserInfo extends UserInfo {}
