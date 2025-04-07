const { app, BrowserWindow } = require('electron');
const { Menu } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,   // Ancho fijo
    height: 500,  // Alto fijo
    resizable: false, // Bloquear redimensionamiento
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // Descomenta para depurar
}

app.whenReady().then(createWindow);
Menu.setApplicationMenu(null);