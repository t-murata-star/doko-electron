/**
 * 型定義として用いる
 */

export class RequestError {
  status = false;
  code = -1;
  text = '';
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
  updateInstallerURLs = {
    windows: '',
    mac: ''
  };
}

export class Restroom {
  id: number = -1;
  gender: string = '';
  place: string = '';
  isUsing: boolean = false;
}
