const path = require('path');
const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
const { app } = electron;

let mainWindow;

// アプリケーション名
const APP_NAME = process.env.npm_package_description || '';
// アプリケーションのバージョンを定義
const VERSION = process.env.npm_package_version || '';
// 本番接続先URL
const DEFAULT_LOAD_URL = 'http://********/';
// アップデートのためのアプリケーションインストーラのダウンロード先ファイルパス
let updateInstallerFilepath = '';
// ElectronAPIのDownloadItemクラスをグローバル変数として格納するための変数
let electronDownloadItem;

// 【メイン・レンダラープロセス共通で使用するグローバル変数】
// 通信エラーによりWEBアプリケーションの読み込みに失敗した場合に表示されるエラー画面のファイルパス
global.ERROR_PAGE_FILEPATH = './public/error.html';
// WEBアプリケーションに接続できたかどうか
global.isConnectedForWebApp = false;

/**
 * 環境変数が設定されていればその設定値を接続先を使用する
 * 設定されていなければ、当プログラムにて定義した接続先を使用する
 */
let webAppURL;

if (process.env.LOAD_URL) {
  webAppURL = process.env.LOAD_URL;
} else {
  webAppURL = DEFAULT_LOAD_URL;
}

function createWindow() {
  // アプリケーションのウインドウサイズを保持
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 750
  });

  mainWindow = new electron.BrowserWindow({
    title: `${APP_NAME} Version ${VERSION}`,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 850,
    minHeight: 531,
    resizable: true,
    fullscreen: false,
    fullscreenable: false,
    maximizable: true,
    webPreferences: {
      devTools: false,
      nodeIntegration: true
    }
  });

  mainWindowState.manage(mainWindow);

  // メニューバーを非表示にする
  mainWindow.setMenuBarVisibility(false);

  // const loadURL = process.env.LOAD_URL || `file://${path.join(__dirname, "../build/index.html")}`;

  // WEBアプリケーションに接続する
  mainWindow.loadURL(webAppURL, { extraHeaders: 'pragma: no-cache\n' }).catch(() => {
    // 通信に失敗した場合は再読み込み用ページへ遷移
    mainWindow.loadFile(global.ERROR_PAGE_FILEPATH);
  });

  // デベロッパーツールを開く
  mainWindow.webContents.openDevTools();

  // ウインドウがクローズされようとするときに発生するイベント
  mainWindow.on('close', closeEvent => {
    closeEvent.preventDefault();
    const index = electron.dialog.showMessageBox(mainWindow, {
      title: APP_NAME,
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: `${APP_NAME}を終了しますか？`
    });

    switch (index) {
      // ダイアログで「OK」を選択した場合
      case 0:
        /**
         * ElectronがWEBアプリケーションを正常に取得した場合のみ、Electron終了時に状態を「退社」に更新する
         * 処理はレンダラープロセスで行う
         */
        if (global.isConnectedForWebApp === true) {
          mainWindow.webContents.send('closeApp');
        } else {
          if (electronDownloadItem) {
            electronDownloadItem.cancel();
          }
          mainWindow.destroy();
        }
        break;

      // ダイアログで「OK」以外を選択した場合
      default:
        break;
    }
  });

  // ウインドウがクローズされると発生するイベント
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /**
   * シャットダウンのイベントキャッチ（Windows限定）
   * HTTPキャッシュをクリアする
   */
  mainWindow.on('session-end', () => {
    mainWindow.webContents.send('electronSessionEndEvent');
  });

  /**
   * ウィンドウが最小化されるときに発生するイベント
   */
  mainWindow.on('minimize', () => {
    mainWindow.webContents.send('electronMinimizeEvent');
  });

  // ウインドウが表示されるときに発生するイベント
  mainWindow.on('show', () => {
    mainWindow.webContents.send('electronShowEvent');
  });

  // ウインドウがリサイズされたときに発生するイベント
  mainWindow.on('resize', () => {
    mainWindow.webContents.send('electronResizeEvent');
  });

  // スクリーンロックのイベントキャッチ
  electron.powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('electronLockScreenEvent');
  });

  // スクリーンアンロックのイベントキャッチ
  electron.powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('electronUnlockScreenEvent');
  });

  // シャットダウンのイベントキャッチ（Electron ver5時点ではLinuxとMacOSのみ対応）
  electron.powerMonitor.on('shutdown', () => {
    mainWindow.webContents.send('electronShutdownEvent');
  });

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    electronDownloadItem = item;
    item.setSavePath(updateInstallerFilepath);
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        showUpdateResumeMessage(item);
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          showUpdateResumeMessage(item);
        } else {
          mainWindow.webContents.send('updateOnProgress', item.getReceivedBytes());
        }
      }
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        mainWindow.webContents.send('updateInstallerDownloadOnSccess', item.getSavePath());
      } else {
        mainWindow.webContents.send('updateInstallerDownloadOnFailed');
      }
    });
  });

  createTray();
}

function showUpdateResumeMessage(item) {
  const index = electron.dialog.showMessageBox(mainWindow, {
    title: APP_NAME,
    type: 'info',
    buttons: ['OK', 'Cancel'],
    message: '通信に失敗したため、ダウンロードを中止しました。\n再開しますか？'
  });

  switch (index) {
    // ダイアログで「OK」を選択した場合
    case 0:
      if (item.canResume()) {
        item.resume();
      } else {
        electron.dialog.showMessageBox(mainWindow, {
          title: APP_NAME,
          type: 'warning',
          buttons: ['OK'],
          message: 'ダウンロードの再開に失敗しました。'
        });
        item.cancel();
        mainWindow.destroy();
      }
      break;

    // ダイアログで「OK」以外を選択した場合
    default:
      item.cancel();
      mainWindow.destroy();
      break;
  }
}

// タスクトレイを作成
function createTray() {
  // 通知領域に表示するアイコンを指定
  var iconPath = path.join(__dirname, '../public/favicon.png');
  const tray = new electron.Tray(iconPath);
  // 通知領域をクリックした際のメニュー
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: '終了',
      click(menuItem) {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(APP_NAME);
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });
}

// 二重起動防止処理
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 2つ目のアプリケーションが起動された場合、1つ目のアプリケーションのウィンドウにフォーカスする
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
    }
  });

  // アプリケーションが初期化処理を完了した時に発生するイベント
  app.on('ready', createWindow);

  // すべてのウィンドウが閉じられた時に発生するイベント
  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    // アプリケーションがアクティブになった時に発生すイベント
    if (mainWindow === null) {
      createWindow();
    }
  });
}

// レンダラープロセスからメインプロセスへのデータ送信（非同期通信）
electron.ipcMain.on('close', event => {
  if (electronDownloadItem) {
    electronDownloadItem.cancel();
  }
  mainWindow.destroy();
});

electron.ipcMain.on('reload', event => {
  // WEBアプリケーションに接続する
  mainWindow.loadURL(webAppURL, { extraHeaders: 'pragma: no-cache\n' }).catch(() => {
    mainWindow.loadFile(global.ERROR_PAGE_FILEPATH);
  });
});

electron.ipcMain.on('connected', (event, isConnected) => {
  global.isConnectedForWebApp = isConnected;
});

electron.ipcMain.on('updateApp', (event, filepath, downloadURL) => {
  updateInstallerFilepath = filepath;
  const webContents = mainWindow.webContents;
  webContents.downloadURL(downloadURL);
});
