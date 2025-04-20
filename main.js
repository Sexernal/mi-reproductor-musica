const { app, BrowserWindow, ipcMain, dialog, Menu, nativeImage } = require('electron');
const path = require('path');

// Helper: genera un nativeImage SVG a partir de un emoji
function iconFromEmoji(emoji) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <rect width="100%" height="100%" fill="none"/>
      <text x="16" y="24" font-size="24" text-anchor="middle" fill="white">${emoji}</text>
    </svg>
  `;
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return nativeImage.createFromDataURL(dataUrl);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 325,
    height: 435,
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
      return result.filePaths;
    } catch (err) {
      console.error('Error al abrir diálogo:', err);
      return [];
    }
  });

  // Eventos IPC para minimizar y cerrar la ventana
  ipcMain.on('minimize-app', () => {
    if (!win.isMinimized()) win.minimize();
  });
  ipcMain.on('close-app', () => win.close());

  // Carga el HTML principal
  win.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Configura los botones en la thumbnail toolbar (barra de tareas)
  win.setThumbarButtons([
    {
      tooltip: 'Anterior',
      icon: iconFromEmoji('⏮'),
      click: () => win.webContents.send('thumbar-prev')
    },
    {
      tooltip: 'Play/Pausa',
      icon: iconFromEmoji('▶'),
      click: () => win.webContents.send('thumbar-play')
    },
    {
      tooltip: 'Siguiente',
      icon: iconFromEmoji('⏭'),
      click: () => win.webContents.send('thumbar-next')
    }
  ]);

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