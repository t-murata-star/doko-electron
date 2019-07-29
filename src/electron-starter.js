const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function showExitDialog() {
  const options = {
    type: 'info',
    buttons: ['OK', 'Cancel'],
    title: '行き先掲示板',
    message: '行き先掲示板を終了しますか？',
  };
  const index = electron.dialog.showMessageBox(mainWindow, options);
  return index;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    toolbar: false,
    width: 1000,
    height: 625,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // メニューバーを非表示にする
  mainWindow.setMenuBarVisibility(false)

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', function (event) {
    switch (showExitDialog()) {

      case 0:
        /**
         * アプリ終了時に状態を「退社」に更新する
         * 処理はレンダラープロセスで行う
         */
        mainWindow.webContents.send('updateStatus', '退社');
        break;

      case 1:
        event.preventDefault();
        break;

      default:
        break;
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  /**
   * スクリーンロックのイベントキャッチ
   * 状態を「離席中」に更新する
   */
  electron.powerMonitor.on('lock-screen', () => {
    mainWindow.webContents.send('updateStatus', '離席中');
  })

/**
 * スクリーンアンロックのイベントキャッチ
 * 状態を「在席」に更新する
 */
  electron.powerMonitor.on('unlock-screen', () => {
    mainWindow.webContents.send('updateStatus', '在席');
  })

  createTray();
}

// タスクトレイを作成
function createTray() {
  // 通知領域に表示するアイコンを指定
  const tray = new electron.Tray('./public/favicon.png');
  // 通知領域をクリックした際のメニュー
  const contextMenu = electron.Menu.buildFromTemplate([
    {
      label: '終了',
      click(menuItem) {
        app.quit();
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('行き先掲示板')
  tray.on('click', () => {
    mainWindow.show();
  })
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
