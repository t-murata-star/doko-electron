import { takeEvery, put, call, select, cancelled, cancel } from 'redux-saga/effects';
import { appActionsAsyncLogic, appActions } from '../../actions/appActions';
import { callAppAPI } from '../api/callAppAPISaga';
import { callUserListAPI } from '../api/callUserListAPISaga';
import {
  showMessageBoxSync,
  showMessageBoxSyncWithReturnValue,
  getUserInfo,
  isLatestMainVersion,
  isLatestRendererVersion,
  versionMigration,
} from '../../components/common/utils';
import {
  APP_NAME,
  MAIN_APP_VERSION,
  APP_DOWNLOAD_URL,
  RENDERER_APP_VERSION,
  NO_USER,
  AppTabIndex,
  BUTTON_CLICK_OK,
} from '../../define';
import { ApiResponse, Login, GetAppInfo, GetUserListWithMyUserIdExists } from '../../define/model';
import { RootState } from '../../modules';
import { callOfficeInfoAPI } from '../api/callOfficeInfoAPISaga';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';
import { updateAppVersionForUserInfo, updateStatusForUserInfo } from '../common/utilsSaga';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

const app = {
  login: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));

      versionMigration();

      const myUserId: number = (electronStore.get('userId') as number | undefined) || NO_USER;

      // メインプロセスに、レンダラープロセス正常に読み込めたことを伝える
      ipcRenderer.send('connected', true);

      yield call(getToken);
      if (yield cancelled()) {
        loadConnectionErrorPage();
        return;
      }

      const getAppInfoResponse: ApiResponse<GetAppInfo> = yield call(callAppAPI.getAppInfo);
      if (getAppInfoResponse.getIsError()) {
        loadConnectionErrorPage();
        return;
      }

      const appInfo = getAppInfoResponse.getPayload();

      yield call(checkUpdatable, appInfo.main.latestVersion);
      if (yield cancelled()) {
        remote.shell.openExternal(APP_DOWNLOAD_URL);
        closeApp();
        return;
      }

      startupRegistration();
      compareLocalVerAndExecutingVer('version.main', MAIN_APP_VERSION, appInfo.main.updatedContents, myUserId);
      compareLocalVerAndExecutingVer('version.renderer', RENDERER_APP_VERSION, appInfo.renderer.updatedContents, myUserId);

      /**
       * 初回起動チェック
       * 設定ファイルが存在しない、もしくはuserIdが設定されていない場合は登録画面を表示する
       */
      if (myUserId === NO_USER) {
        yield put(initialStartupModalActions.showModal(true));
        return;
      }

      const getUserListResponse: ApiResponse<GetUserListWithMyUserIdExists[]> = yield call(
        callUserListAPI.getUserListWithMyUserIdExists,
        myUserId
      );
      if (getUserListResponse.getIsError()) {
        return;
      }

      const userList = getUserListResponse.getPayload();
      const userInfo = getUserInfo(userList, myUserId);

      /**
       * サーバ上に自分の情報が存在するかどうかチェック
       * 無ければ新規登録画面へ遷移する
       */
      if (userInfo === null) {
        return;
      }

      yield call(updateAppVersionForUserInfo, userInfo, myUserId);
      yield call(updateStatusForUserInfo, userInfo, myUserId);
      yield put(appActions.setMyUserId(myUserId));
      yield call(callUserListAPI.sendHealthCheck);
      yield put(appActions.isShowLoadingPopup(true));
    } catch (error) {
      loadConnectionErrorPage();
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  // アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
  sendHealthCheck: function* () {
    try {
      yield call(callUserListAPI.sendHealthCheck);
    } catch (error) {
      console.error(error);
    }
  },

  regularCheckUpdatable: function* () {
    try {
      /**
       * ダイアログ表示中もsetIntervalが動いており、並列実行されると
       * ダイアログが連続で表示される等の問題が生じるため、
       * saga実行中の多重実行を防止する
       */
      yield put(appActions.regularCheckUpdatableEnabled(false));

      // お知らせチェック
      const getAppInfoResponse: ApiResponse<GetAppInfo> = yield call(callAppAPI.getAppInfo);
      if (getAppInfoResponse.getIsError()) {
        return;
      }
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

      yield put(appActions.regularCheckUpdatableEnabled(true));
    } catch (error) {
      console.error(error);
    }
  },

  clickTabbar: function* (action: ReturnType<typeof appActionsAsyncLogic.clickTabbar>) {
    try {
      const state: RootState = yield select();
      const myUserId = state.appState.myUserId;
      const activeIndex = action.payload.activeIndex;
      yield put(appActions.setActiveIndex(activeIndex));

      // 同じタブを複数押下した場合
      if (state.appState.activeIndex === activeIndex) {
        return;
      }

      yield put(appActions.isShowLoadingPopup(true));

      switch (activeIndex) {
        // 社員情報タブを選択
        case AppTabIndex.userInfo:
          yield call(callUserListAPI.getUserListWithMyUserIdExists, myUserId);
          break;

        // 社内情報タブを選択
        case AppTabIndex.officeInfo:
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

/**
 * ログイン処理（認証トークン取得）
 */
const getToken = function* () {
  const loginResponse: ApiResponse<Login> = yield call(callAppAPI.login);
  if (loginResponse.getIsError()) {
    loadConnectionErrorPage();
    yield cancel();
  }
};

/**
 * アプリケーションが更新可能かチェック
 * 実行しているアプリケーションのバージョンが最新ではない場合、
 * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
 */
const checkUpdatable = function* (latestVersion: string) {
  const updateAppInfoMessage = `新しい${APP_NAME}が公開されました。\nVersion ${latestVersion}\nお手数ですがアップデートをお願いします。`;
  if (isLatestMainVersion(latestVersion) === false) {
    showMessageBoxSync(updateAppInfoMessage);
    yield cancel();
  }
};

/**
 * スタートアップ登録処理
 * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
 */
const startupRegistration = () => {
  if (!electronStore.get('startup.notified')) {
    const index = showMessageBoxSyncWithReturnValue(
      'YES',
      'NO',
      `スタートアップを有効にしますか？\n※PCを起動した際に自動的に${APP_NAME}が起動します。`
    );
    let openAtLogin = false;

    switch (index) {
      // ダイアログで「OK」を選択した場合
      case BUTTON_CLICK_OK:
        openAtLogin = true;
        break;

      // ダイアログで「OK」以外を選択した場合
      default:
        openAtLogin = false;
        break;
    }

    const STARTUP_NOTIFIED = 1;
    electronStore.set('startup.notified', STARTUP_NOTIFIED);

    remote.app.setLoginItemSettings({
      openAtLogin,
      path: remote.app.getPath('exe'),
    });
  }
};

/**
 * ローカル設定ファイルのバージョンと現在実行中のバージョンを比較する
 * 異なる場合、アップデート内容のメッセージを表示する
 */
const compareLocalVerAndExecutingVer = (localVer: string, executingVer: string, updatedContents: string, myUserId: number) => {
  if (electronStore.get(localVer) !== executingVer) {
    // ユーザ登録済み場合
    if (myUserId !== NO_USER) {
      showMessageBoxSync(updatedContents);
    }
    electronStore.set(localVer, executingVer);
  }
};

const loadConnectionErrorPage = () => {
  ipcRenderer.send('connected', false);
  remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
};

const closeApp = () => {
  if (remote.getCurrentWindow().isDestroyed() === false) {
    remote.getCurrentWindow().destroy();
  }
};

export const appSaga = Object.entries(app).map((value: [string, any]) => {
  return takeEvery(`app/logic/${value[0]}`, value[1]);
});
