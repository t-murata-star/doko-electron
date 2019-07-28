const API_URL = 'http://localhost:3001/';

const electron = require('electron');
const { net } = require('electron')
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const Store = require('electron-store');
const electronStore = new Store();

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

      // アプリ終了時に状態を「退社」に更新する
      case 0:
        const getUserList = net.request({
          method: 'GET',
          url: API_URL + 'userList',
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
        });
        getUserList.end()

        getUserList.on('response', (response) => {
          if (response.statusCode !== 200) {
            return;
          }
          response.on('data', (chunk) => {
            const userID = electronStore.get('userID');
            const userList = JSON.parse(`${chunk}`);
            const userInfo = getUserInfo(userList, userID);
            const userInfoLength = Object.keys(userInfo).length;

            if (userInfoLength === 0) {
              return;
            }

            userInfo['status'] = '退社';
            const putUserList = net.request({
              method: 'PUT',
              url: API_URL + 'userList/' + userID,
              headers: {
                "Content-type": "application/json; charset=UTF-8"
              },
            });
            const body = JSON.stringify(userInfo);
            putUserList.end(body);
          })
        })
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

// function updateUserInfo(userInfo, id) {
//   return () => {
//     return fetch(API_URL + 'userList/' + id,
//       {
//         method: 'PUT',
//         headers: HEADERS,
//         body: JSON.stringify(userInfo),
//       })
//       .then(res => {
//         if (!res.ok || res.status === 404) {
//           return Promise.reject(new Error(res.statusText));
//         }
//         return;
//       });
//   }
// };

function getUserInfo(userList, userID) {
  if (!userList) {
    return {};
  }
  const userInfo = userList
    .filter(function (userInfo) {
      return userInfo['id'] === userID;
    })[0];
  return userInfo || {};
}
