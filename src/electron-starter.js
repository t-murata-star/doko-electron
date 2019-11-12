const electron = require('electron');
const { ipcMain, session } = require('electron');
const path = require('path');
const Store = require('electron-store');
const electronStore = new Store();

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

// アプリケーションのバージョンを定義
const VERSION = '2.0.0';
// 本番接続先URL
const DEFAULT_LOAD_URL = 'http://********/';

function createWindow() {
  mainWindow = new BrowserWindow({
    title: `行き先掲示板 Version ${VERSION}`,
    width: 1200,
    height: 750,
    resizable: false,
    fullscreen: false,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true
    }
  });

  // メニューバーを非表示にする
  mainWindow.setMenuBarVisibility(false);

  // const loadURL = process.env.LOAD_URL || `file://${path.join(__dirname, "../build/index.html")}`;

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

  // Cookieにアプリケーションのバージョンを追加
  session.defaultSession.cookies.set({ url: webAppURL, name: 'version', value: VERSION });

  // WEBアプリケーションに接続する
  mainWindow.loadURL(webAppURL);

  // デベロッパーツールを開く
  mainWindow.webContents.openDevTools();

  // ウインドウがクローズされようとするときに発生するイベント
  mainWindow.on('close', closeEvent => {
    closeEvent.preventDefault();
    const index = electron.dialog.showMessageBox(mainWindow, {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: '行き先掲示板を終了しますか？'
    });

    switch (index) {
      // ダイアログで「OK」を選択した場合
      case 0:
        /**
         * ElectronがWEBアプリケーションを正常に取得した場合のみ、Electron終了時に状態を「退社」に更新する
         * 処理はレンダラープロセスで行う
         */
        session.defaultSession.cookies.get({ name: 'isConnected' }).then(cookies => {
          if (cookies[0]) {
            mainWindow.webContents.send('appClose');
          } else {
            mainWindow.destroy();
          }
        });
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
    session.defaultSession.clearCache(() => {});
  });

  /**
   * ウィンドウが最小化されるときに発生するイベント
   */
  mainWindow.on('minimize', event => {
    event.preventDefault();
    mainWindow.hide();
  });

  /**
   * スクリーンロックのイベントキャッチ
   * 状態を「離席中」に更新する
   */
  electron.powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('updateInfo', 'status', '在席 (離席中)');
  });

  /**
   * スクリーンアンロックのイベントキャッチ
   * 状態を「在席」に更新する
   */
  electron.powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('updateInfo', 'status', '在席');
  });

  /**
   * シャットダウンのイベントキャッチ（Electron ver5時点ではLinuxとMacOSのみ対応）
   * HTTPキャッシュをクリアする
   */
  electron.powerMonitor.on('shutdown', () => {
    session.defaultSession.clearCache(() => {});
  });

  createTray();

  /**
   * スタートアップ登録処理。
   * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
   */
  if (!electronStore.get('notified_startup')) {
    const index = electron.dialog.showMessageBox(mainWindow, {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['YES', 'NO'],
      message: 'スタートアップを有効にしますか？\n※PC起動時、自動的に行き先掲示板が起動します。'
    });

    if (index === 0) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: electron.app.getPath('exe')
      });
    }

    electronStore.set('notified_startup', 1);
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
  tray.setToolTip('行き先掲示板');
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
ipcMain.on('close', (event, arg) => {
  mainWindow.destroy();
});
