const path = require('path');
const electron = require('electron');
const { app } = electron;

let mainWindow;

// アプリケーションのバージョンを定義
const VERSION = '2.0.0';
// 本番接続先URL
const DEFAULT_LOAD_URL = 'http://********/';

function createWindow() {
  mainWindow = new electron.BrowserWindow({
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
  electron.session.defaultSession.cookies.set({ url: webAppURL, name: 'version', value: VERSION });

  // WEBアプリケーションに接続する
  mainWindow.loadURL(webAppURL).catch(() => {
    mainWindow.reload();
  });

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
        electron.session.defaultSession.cookies.get({ name: 'isConnected' }).then(cookies => {
          if (cookies[0]) {
            mainWindow.webContents.send('closeApp');
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

  /**
   * スクリーンロックのイベントキャッチ
   * 状態を「離席中」に更新する
   */
  electron.powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('electronLockScreenEvent');
  });

  /**
   * スクリーンアンロックのイベントキャッチ
   * 状態を「在席」に更新する
   */
  electron.powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('electronUnlockScreenEvent');
  });

  /**
   * シャットダウンのイベントキャッチ（Electron ver5時点ではLinuxとMacOSのみ対応）
   */
  electron.powerMonitor.on('shutdown', () => {
    mainWindow.webContents.send('electronShutdownEvent');
  });

  createTray();
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
electron.ipcMain.on('close', (event, arg) => {
  mainWindow.destroy();
});
