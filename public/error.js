const { ipcRenderer } = window.require('electron');
const $ = window.require('jquery');

const reload = () => {
  // メインプロセスへipc通信を行い、メインプロセスでリロード実行
  $('.reload-btn').prop('disabled', true);
  ipcRenderer.send('reload');
};
