import { app, BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';
import  path from 'path';

let mainWindow: BrowserWindow | null;
/**
 * Create Application Window
 * @returns { BrowserWindow } Application Window Instance
*/

export const createWindow = () => {
  const minWidth = 960;
  const minHeight = 660;

  const savedWindowState = windowStateKeeper({
    defaultWidth: minWidth,
    defaultHeight: minHeight,
    maximize: false,
  });

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    x: savedWindowState.x,
    y: savedWindowState.y,
    width: savedWindowState.width,
    height: savedWindowState.height,
    minWidth: minWidth,
    minHeight: minHeight,
    show: true,
    // autoHideMenuBar: true,
    frame: true,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  };

  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hidden';
  }

  mainWindow = new BrowserWindow(windowOptions);
  
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {

    // Load the Vite development server
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    // Load the production index.html
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Show window when is ready to
  mainWindow.on('ready-to-show', () => {
    mainWindow && mainWindow.show();
  });
    
  savedWindowState.manage(mainWindow);
 

  // Close all windows when main window is closed
  mainWindow.on('close', () => {
    mainWindow = null;
    app.quit();
  });

  return mainWindow
}

