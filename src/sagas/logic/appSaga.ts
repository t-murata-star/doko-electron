import { takeEvery, put, call, select } from 'redux-saga/effects';
import { appActionsAsyncLogic, appActions } from '../../actions/appActions';
import { callAppAPI } from '../api/callAppAPISaga';
import { callUserListAPI } from '../api/callUserListAPISaga';
import {
  showMessageBoxSync,
  showMessageBoxSyncWithReturnValue,
  getUserInfo,
  isLatestMainVersion,
  isLatestRendererVersion,
  migration,
} from '../../components/common/utils';
import { AUTH_REQUEST_HEADERS, APP_NAME, MAIN_APP_VERSION, APP_DOWNLOAD_URL, USER_STATUS_INFO } from '../../define';
import {
  ApiResponse,
  UserInfoForUpdate,
  UserInfo,
  Login,
  GetAppInfo,
  GetUserListWithMyUserIdExists,
  UpdateUserInfo,
} from '../../define/model';
import { RootState } from '../../modules';
import { callOfficeInfoAPI } from '../api/callOfficeInfoAPISaga';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';
import { userListActions } from '../../actions/userInfo/userListActions';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

const app = {
  login: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));

      migration();

      const userId: number = (electronStore.get('userId') as number | undefined) || -1;

      // メインプロセスに、レンダラープロセスに接続できたことを伝える
      ipcRenderer.send('connected', true);

      // ログイン処理（認証トークン取得）
      const loginResponse: ApiResponse<Login> = yield call(callAppAPI.login);
      if (loginResponse.getIsError()) {
        ipcRenderer.send('connected', false);
        remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
        return;
      }

      // APIリクエストヘッダに認証トークンを設定する
      AUTH_REQUEST_HEADERS.Authorization = 'Bearer ' + loginResponse.getPayload().token;

      // お知らせチェック
      const getAppInfoResponse: ApiResponse<GetAppInfo> = yield call(callAppAPI.getAppInfo);
      const appInfo = getAppInfoResponse.getPayload();
      const updateAppInfoMessage = `新しい${APP_NAME}が公開されました。\nVersion ${appInfo.main.latestVersion}\nお手数ですがアップデートをお願いします。`;

      /**
       * バージョンチェック
       * 実行しているアプリケーションのバージョンが最新ではない場合、
       * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
       */
      if (isLatestMainVersion(appInfo.main.latestVersion) === false) {
        showMessageBoxSync(updateAppInfoMessage);
        remote.shell.openExternal(APP_DOWNLOAD_URL);
        closeApp();
        return;
      }

      /**
       * スタートアップ登録処理。
       * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
       */
      if (!electronStore.get('startup.notified')) {
        const index = showMessageBoxSyncWithReturnValue(
          'YES',
          'NO',
          `スタートアップを有効にしますか？\n※PCを起動した際に自動的に${APP_NAME}が起動します。`
        );
        let openAtLogin;

        switch (index) {
          // ダイアログで「OK」を選択した場合
          case 0:
            openAtLogin = true;
            break;

          // ダイアログで「OK」以外を選択した場合
          default:
            openAtLogin = false;
            break;
        }

        electronStore.set('startup.notified', 1);

        remote.app.setLoginItemSettings({
          openAtLogin,
          path: remote.app.getPath('exe'),
        });
      }

      /**
       * 設定ファイル内のバージョン(main)とmainのバージョンが異なる場合、
       * アップデート後の初回起動と判断し、一度だけアップデート情報を表示する
       */
      if (electronStore.get('version.main') !== MAIN_APP_VERSION) {
        // ユーザ登録済み場合
        if (userId !== -1) {
          showMessageBoxSync(appInfo.main.updatedContents);
        }
        electronStore.set('version.main', MAIN_APP_VERSION);
      }

      /**
       * 設定ファイル内のバージョン(renderer)とサーバで定義された最新バージョンが異なる場合、
       * 一度だけアップデート情報を表示する。
       */
      if (electronStore.get('version.renderer') !== appInfo.renderer.latestVersion) {
        // ユーザ登録済み場合
        if (userId !== -1) {
          showMessageBoxSync(appInfo.renderer.updatedContents);
        }
        electronStore.set('version.renderer', appInfo.renderer.latestVersion);
      }

      /**
       * 初回起動チェック
       * 設定ファイルが存在しない、もしくはuserIdが設定されていない場合は登録画面を表示する
       */
      if (userId === -1) {
        yield put(initialStartupModalActions.showModal(true));
        return;
      }

      const getUserListResponse: ApiResponse<GetUserListWithMyUserIdExists[]> = yield call(
        callUserListAPI.getUserListWithMyUserIdExists,
        userId
      );
      if (getUserListResponse.getIsError()) {
        return;
      }

      const userList = getUserListResponse.getPayload();
      const userInfo = getUserInfo(userList, userId);

      /**
       * サーバ上に自分の情報が存在するかどうかチェック
       * 無ければ新規登録画面へ遷移する
       */
      if (userInfo === null) {
        return;
      }

      // 変更対象のキーのみをリクエストパラメータに付与するために用いる（通信パケット削減）
      const updatedUserInfo: UserInfoForUpdate = {};
      // ローカルのstate（userList）を更新するために用いる
      let updatedUserInfoState: UserInfo = { ...userInfo };
      if (userInfo.version !== MAIN_APP_VERSION) {
        updatedUserInfo.version = MAIN_APP_VERSION;
        // アプリバージョンのみ更新（更新日時も更新されない）
        yield call(callUserListAPI.updateUserInfo, updatedUserInfo, userId);

        // ローカルのstate（userList）を更新する
        updatedUserInfoState.version = updatedUserInfo.version;
        yield put(userListActions.updateUserInfoState(userId, updatedUserInfoState));
      }

      // 状態を「在席」に更新する（更新日時も更新される）
      if (
        userInfo.status === USER_STATUS_INFO.s02.status ||
        userInfo.status === USER_STATUS_INFO.s01.status ||
        userInfo.status === USER_STATUS_INFO.s13.status
      ) {
        updatedUserInfo.status = USER_STATUS_INFO.s01.status;
        updatedUserInfo.name = userInfo.name;
        const updateUserInfoResponse: ApiResponse<UpdateUserInfo> = yield call(
          callUserListAPI.updateUserInfo,
          updatedUserInfo,
          userId
        );

        // ローカルのstate（userList）を更新する
        updatedUserInfoState.status = updatedUserInfo.status;
        updatedUserInfoState.updatedAt = updateUserInfoResponse.getPayload().updatedAt;
        yield put(userListActions.updateUserInfoState(userId, updatedUserInfoState));
      }

      yield put(appActions.setMyUserId(userId));

      yield call(callAppAPI.sendHealthCheck);
      yield put(appActions.isShowLoadingPopup(true));
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  // アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
  sendHealthCheck: function* () {
    try {
      yield call(callAppAPI.sendHealthCheck);
    } catch (error) {
      console.error(error);
    }
  },

  checkVersion: function* () {
    try {
      /**
       * ダイアログ表示中もsetIntervalが動いており、並列実行されると
       * ダイアログが連続で表示される等の問題が生じるため、
       * saga実行中の多重実行を防止する
       */
      yield put(appActions.regularCheckVersionEnabled(false));

      // お知らせチェック
      const getAppInfoResponse: ApiResponse<GetAppInfo> = yield call(callAppAPI.getAppInfo);
      const appInfo = getAppInfoResponse.getPayload();

      /**
       * バージョンチェック(main)
       * 実行しているアプリケーションのバージョンが最新ではない場合、
       * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
       */
      if (isLatestMainVersion(appInfo.main.latestVersion) === false) {
        const updatedContents = `新しい${APP_NAME}が公開されました。\nVersion ${appInfo.main.latestVersion}\nお手数ですがアップデートをお願いします。`;
        showMessageBoxSync(updatedContents);
        remote.shell.openExternal(APP_DOWNLOAD_URL);
        closeApp();
        return;
      }

      /**
       * バージョンチェック(renderer)
       * 画面を更新する(WEBアプリのアップデート)
       */
      if (isLatestRendererVersion(appInfo.renderer.latestVersion) === false) {
        const updatedContents = `アプリケーションがアップデートされました。\n${APP_NAME}を再起動します。`;
        showMessageBoxSync(updatedContents);
        ipcRenderer.send('reload');
        return;
      }

      yield put(appActions.regularCheckVersionEnabled(true));
    } catch (error) {
      console.error(error);
    }
  },

  clickTabbar: function* (action: ReturnType<typeof appActionsAsyncLogic.clickTabbar>) {
    try {
      yield put(appActions.isShowLoadingPopup(true));

      const state: RootState = yield select();
      const myUserId = state.appState.myUserId;
      const activeIndex = action.payload.activeIndex;
      yield put(appActions.setActiveIndex(activeIndex));

      // 同じタブを複数押下した場合
      if (state.appState.activeIndex === activeIndex) {
        return;
      }

      switch (activeIndex) {
        // 社内情報タブを選択
        case 0:
          yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
          break;

        // 社員情報タブを選択
        case 1:
          yield call(callOfficeInfoAPI.getOfficeInfo);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

const closeApp = () => {
  if (remote.getCurrentWindow().isDestroyed() === false) {
    remote.getCurrentWindow().destroy();
  }
};

export const appSaga = Object.entries(app).map((value: [string, any]) => {
  return takeEvery(`app/logic/${value[0]}`, value[1]);
});
