/**
 * 型定義として用いる
 */

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

export class Notification {
  enabled: boolean = false;
  content: string = '';
  latestAppVersion: string = '';
  updateInstaller = {
    windows: {
      fileName: '',
      fileByteSize: 0
    },
    mac: {
      fileName: '',
      fileByteSize: 0
    }
  };
}

export class Restroom {
  id: number = -1;
  gender: string = '';
  place: string = '';
  isUsing: boolean = false;
}
