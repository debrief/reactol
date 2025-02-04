import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import { createWindow } from './appWindow'
import * as fs from 'fs'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.info(`Added Extension:  ${name}`))
    .catch((err) => console.info('An error occurred: ', err))
})

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    // mainWindow = createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('open-file', async () => {
  const { filePaths } = await dialog.showOpenDialog({ title: 'Open existing document',  filters: [{ name: 'GeoJSON', extensions: ['geojson', 'json'] }] })

  if (filePaths.length > 0) {
    const content = fs.readFileSync(filePaths[0], 'utf-8')
    return { filePath: filePaths[0], content }
  }
  return null
})

ipcMain.handle('save-file', async (_, { filePath, content }) => {
  if (!filePath) {
    const result = await dialog.showSaveDialog({ filters: [{ name: 'GeoJSON', extensions: ['geojson', 'json'] }] })

    if (!result.filePath) {
      return null
    }

    filePath = result.filePath
  }

  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
})

ipcMain.handle('save-file-dialog', async () => {
  const { filePath } = await dialog.showSaveDialog({ title: 'Create new document',
    filters: [{ name: 'GeoJSON Files', extensions: ['geojson', 'json'] }]
  })
  return filePath ? { filePath } : null
})
