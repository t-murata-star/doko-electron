import { takeEvery, put, call, select } from 'redux-saga/effects';
import { appActionsAsyncLogic, appActions } from '../../actions/appActions';
import { callAppAPI } from '../api/callAppAPISaga';
import { callUserListAPI } from '../api/callUserListAPISaga';
import { showMessageBoxSync, showMessageBoxSyncWithReturnValue, getUserInfo } from '../../components/common/functions';
import {
  AUTH_REQUEST_HEADERS,
  APP_NAME,
  APP_VERSION,
  APP_DOWNLOAD_URL,
  HEALTH_CHECK_INTERVAL_MS,
  USER_STATUS_INFO,
} from '../../define';
import { ApiResponse, UserInfoForUpdate, UserInfo } from '../../define/model';
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

      const userID: number = (electronStore.get('userID') as number | undefined) || -1;

      // メインプロセスに、レンダラープロセスに接続できたことを伝える
      ipcRenderer.send('connected', true);

      // ログイン処理（認証トークン取得）
      const loginResponse: ApiResponse = yield call(callAppAPI.login);
      if (loginResponse.getIsError()) {
        ipcRenderer.send('connected', false);
        remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
        return;
      }

      // APIリクエストヘッダに認証トークンを設定する
      AUTH_REQUEST_HEADERS.Authorization = 'Bearer ' + loginResponse.getPayload().token;

      // お知らせチェック
      const getNotificationResponse: ApiResponse = yield call(callAppAPI.getNotification);
      const updateNotificationMessage = `新しい${APP_NAME}が公開されました。\nVersion ${
        getNotificationResponse.getPayload().latestAppVersion
      }\nお手数ですがアップデートをお願いします。`;

      /**
       * バージョンチェック
       * 実行しているアプリケーションのバージョンが最新ではない場合、
       * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
       */
      if (getNotificationResponse.getPayload().latestAppVersion !== APP_VERSION) {
        showMessageBoxSync(updateNotificationMessage);
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
       * お知らせチェック
       * appVersion が latestAppVersion と異なる場合、アップデート後の初回起動と判断し、
       * 一度だけお知らせを表示する。
       */
      if (electronStore.get('appVersion') !== APP_VERSION) {
        showMessageBoxSync(getNotificationResponse.getPayload().content);
        electronStore.set('appVersion', APP_VERSION);
      }

      /**
       * アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
       */
      setInterval(function* () {
        yield call(callAppAPI.sendHealthCheck);
      }, HEALTH_CHECK_INTERVAL_MS);

      /**
       * 初回起動チェック
       * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
       */
      if (userID === -1) {
        yield put(initialStartupModalActions.showModal(true));
        return;
      }

      const getUserListResponse: ApiResponse = yield call(callUserListAPI.getUserListWithMyUserIDExists, userID);
      if (getUserListResponse.getIsError()) {
        return;
      }

      const userList: UserInfo[] = JSON.parse(JSON.stringify(getUserListResponse.getPayload()));
      const userInfo = getUserInfo(userList, userID);

      /**
       * サーバ上に自分の情報が存在するかどうかチェック
       * 無ければ新規登録画面へ遷移する
       */
      if (userInfo === null) {
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      if (userInfo.version !== APP_VERSION) {
        updatedUserInfo.version = APP_VERSION;
        // アプリバージョンのみ更新（更新日時も更新されない）
        yield call(callUserListAPI.updateUserInfo, updatedUserInfo, userID);
      }

      // 状態を「在席」に更新する（更新日時も更新される）
      if (
        userInfo.status === USER_STATUS_INFO.s02.status ||
        userInfo.status === USER_STATUS_INFO.s01.status ||
        userInfo.status === USER_STATUS_INFO.s13.status
      ) {
        userInfo.status = USER_STATUS_INFO.s01.status;
        updatedUserInfo.status = userInfo.status;
        updatedUserInfo.name = userInfo.name;
        yield call(callUserListAPI.updateUserInfo, updatedUserInfo, userID);
      }

      yield put(userListActions.reRenderUserList());
      yield put(appActions.setMyUserId(userID));

      yield call(callAppAPI.sendHealthCheck);
      yield put(appActions.isShowLoadingPopup(true));
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  sendHealthCheck: function* () {
    try {
      yield call(callAppAPI.sendHealthCheck);
    } catch (error) {
      console.error(error);
    }
  },

  clickTabbar: function* (action: ReturnType<typeof appActionsAsyncLogic.clickTabbar>) {
    try {
      yield put(appActions.isShowLoadingPopup(true));

      const state: RootState = yield select();
      const myUserID = state.appState.myUserID;
      const activeIndex = action.payload.activeIndex;
      yield put(appActions.setActiveIndex(activeIndex));

      // 同じタブを複数押下した場合
      if (state.appState.activeIndex === activeIndex) {
        return;
      }

      switch (activeIndex) {
        // 社内情報タブを選択
        case 0:
          yield call(callUserListAPI.getUserListWithMyUserIDExists, myUserID);
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
