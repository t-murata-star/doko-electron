const electron = require('electron');
const path = require("path");
const Store = require('electron-store');
const electronStore = new Store();

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    toolbar: false,
    width: 1000,
    height: 625,
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

  // and load the index.html of the app.
  // const loadURL = process.env.LOAD_URL || `file://${path.join(__dirname, "../build/index.html")}`;

  // 設定ファイルに接続先URLを設定する。既に設定されていればその設定値を読み込んで使用する
  if (!electronStore.get('loadURL')) {
    const loadURL = 'http://********/';
    electronStore.set('loadURL', loadURL);
  }

  mainWindow.loadURL(electronStore.get('loadURL'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', (closeEvent) => {
    const index = electron.dialog.showMessageBox(mainWindow, {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['OK', 'Cancel'],
      message: '行き先掲示板を終了しますか？',
    });

    switch (index) {
      case 0:
        /**
         * アプリ終了時に状態を「退社」に更新する
         * 処理はレンダラープロセスで行う
         */
        mainWindow.webContents.send('updateInfo', 'status', '退社');
        break;

      case 1:
        closeEvent.preventDefault();
        break;

      default:
        break;
    }
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  mainWindow.on('minimize', (event) => {
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

  createTray();

  // 初回起動時、スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
  if (!electronStore.get('notified_startup')) {
    const index = electron.dialog.showMessageBox(mainWindow, {
      title: '行き先掲示板',
      type: 'info',
      buttons: ['YES', 'NO'],
      message: 'スタートアップを有効にしますか？\n※PC起動時、自動的に行き先掲示板が起動します。',
    });

    if (index === 0) {
      app.setLoginItemSettings({
        openAtLogin: false,
        path: electron.app.getPath('exe'),
      });
    }

    electronStore.set('notified_startup', 1);
  }
  // const userHome = process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
  // const startupPath = path.join(userHome, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
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
  ])

  tray.setContextMenu(contextMenu);
  tray.setToolTip('行き先掲示板');
  tray.on('click', () => {
    mainWindow.show();
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
