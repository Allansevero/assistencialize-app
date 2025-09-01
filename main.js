// CÓDIGO FINAL E ATUALIZADO para main.js com alerta de atualização

const { app, BrowserWindow, session, dialog } = require('electron'); // Adicionamos 'dialog' aqui
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    }
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  mainWindow.loadFile('index.html');

  // MUDANÇA IMPORTANTE: Em vez de notificar, apenas verificamos por atualizações.
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });
}

// NOVO BLOCO: Lógica para quando uma atualização for baixada
autoUpdater.on('update-downloaded', (info) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Reiniciar Agora', 'Depois'],
    title: 'Atualização Disponível',
    message: process.platform === 'win32' ? info.releaseNotes : info.releaseName,
    detail: 'Uma nova versão foi baixada. Reinicie o aplicativo para aplicar as atualizações.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
