import { RootState } from '../modules';
import { NO_USER, NO_VACANT } from '.';

/**
 * プロジェクト内独自の型定義
 */

export type Props = {
  state: RootState;
  dispatch: any;
};

export class ApiResponse<T> {
  constructor(private payload: T, private isError: boolean) {
    this.payload = payload;
    this.isError = isError;
  }

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
  email?: string;
  healthCheckAt?: string;
  mainAppVersion?: string;
  rendererAppVersion?: string;
}

/**
 * DBの型定義
 */

export class AppInfo {
  main = {
    latestVersion: '',
    updatedContents: '',
  };
  renderer = {
    latestVersion: '',
    updatedContents: '',
  };
  displayTimeOfCompanyInfo = {
    start: '',
    end: '',
  };
}

export class Restroom {
  id: number = NO_USER;
  gender: string = '';
  place: string = '';
  isUsing: boolean = false;
}

export class RestroomInfo {
  rooms: Restroom[] = [new Restroom()];
  isNoVacancyForMen: boolean | null = null;
  isNoVacancyForWomen: boolean | null = null;
  vacancyForMen: number = NO_VACANT;
  vacancyForWomen: number = NO_VACANT;
}

export class OfficeInfo {
  tempreture: number | null = null;
  humidity: number | null = null;
}

export class UserInfo {
  id: number = NO_USER;
  order: number = NO_USER;
  name: string = '';
  status: string = '';
  destination: string = '';
  return: string = '';
  updatedAt: string = '';
  message: string = '';
  email: string = '';
  healthCheckAt: string = '';
  mainAppVersion: string = '';
  rendererAppVersion: string = '';
}

// APIレスポンスの型定義
export interface Login {
  token: string;
}

export interface GetAppInfo extends AppInfo {}

export interface GetCurrentTime {
  currentTime: string;
}

export interface SendHealthCheck extends UserInfo {}

export interface GetRestroomUsage extends Restroom {}

export interface GetOfficeInfo extends OfficeInfo {}

export interface DeleteUser {}

export interface AddUser extends UserInfo {}

export interface GetUserList extends UserInfo {}

export interface GetUserListAndCheckMyUserIdExists extends UserInfo {}

export interface UpdateUserInfo extends UserInfo {}

export interface UpdateAppVersion extends UserInfo {}

export interface ChangeOrder extends UserInfo {}
