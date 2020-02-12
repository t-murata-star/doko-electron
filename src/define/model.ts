import { RootState } from '../modules';

/**
 * 型定義として用いる
 */

export type Props = {
  state: RootState;
  dispatch: any;
};

export class ApiResponse {
  private payload: any = null;
  private isError: boolean = false;

  constructor(payload: any = null, isError: boolean = false) {
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
  heartbeat: string = '';
}

export class UserStatus {
  s01 = '在席';
  s02 = '退社';
  s03 = '年休';
  s04 = 'AM半休';
  s05 = 'PM半休';
  s06 = 'FLEX';
  s07 = '出張';
  s08 = '外出';
  s09 = '本社外勤務';
  s10 = '遅刻';
  s11 = '行方不明';
  s12 = '接客中';
  s13 = '在席 (離席中)';
}

export class Notification {
  content: string = '';
  latestAppVersion: string = '';
  updateInstaller = {
    windows: {
      fileName: ''
    },
    mac: {
      fileName: ''
    }
  };
}

export class Restroom {
  id: number = -1;
  gender: string = '';
  place: string = '';
  isUsing: boolean = false;
}
