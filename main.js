const { app, BrowserWindow, ipcMain, dialog, Menu, nativeImage } = require('electron');
const path = require('path');

let win;

// Helper mejorado para íconos
function createThumbarIcon(iconName) {
  return nativeImage.createFromPath(path.join(__dirname, 'assets', `${iconName}.png`))
    .resize({ width: 24, height: 24 });
}

function createWindow() {
  win = new BrowserWindow({
    width: 325,
    height: 435,
    resizable: false,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  // Configurar ThumbarButtons
  const updateThumbar = (isPlaying = false) => {
    win.setThumbarButtons([
      {
        tooltip: 'Anterior',
        icon: createThumbarIcon('prev'),
        click: () => win.webContents.send('thumbar-prev')
      },
      {
        tooltip: isPlaying ? 'Pausar' : 'Reproducir',
        icon: createThumbarIcon(isPlaying ? 'pause' : 'play'),
        click: () => win.webContents.send('thumbar-play')
      },
      {
        tooltip: 'Siguiente',
        icon: createThumbarIcon('next'),
        click: () => win.webContents.send('thumbar-next')
      }
    ]);
  };

  // Eventos IPC principales
  ipcMain.handle('open-folder-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory']
      });
      return result.filePaths;
    } catch (err) {
      console.error('Error al abrir diálogo:', err);
      return [];
    }
  });

  ipcMain.on('minimize-app', () => !win.isMinimized() && win.minimize());
  ipcMain.on('close-app', () => win.close());
  ipcMain.on('update-thumbar', (_, isPlaying) => updateThumbar(isPlaying));

  // Configurar eventos de ventana
  win.on('ready-to-show', () => {
    updateThumbar();
    win.show();
  });

  // Cargar la aplicación
  win.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Para depuración:
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});