const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 350,
    height: 400,
    resizable: false,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Manejo del diálogo de selección de carpeta
  ipcMain.handle('open-folder-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
      });
      return result.filePaths; // Retorna la ruta de la carpeta seleccionada
    } catch (err) {
      console.error('Error al abrir diálogo:', err);
      return [];
    }
  });

  // Eventos para minimizar y cerrar la ventana
  ipcMain.on('minimize-app', () => {
    if (!win.isMinimized()) {
      win.minimize();
    }
  });

  ipcMain.on('close-app', () => {
    win.close();
  });

  // Carga el archivo HTML principal
  win.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Descomenta para debug
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // En macOS, es común que las apps sigan activas hasta que el usuario cierra explícitamente
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // En macOS, volver a crear ventana si no hay otras ventanas abiertas
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});