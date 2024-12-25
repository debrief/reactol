import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import { createWindow } from './appWindow';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.info(`Added Extension:  ${name}`))
    .catch((err) => console.info('An error occurred: ', err));
});

app.whenReady().then(createWindow);

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Emitted when all windows have been closed.
*/
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
