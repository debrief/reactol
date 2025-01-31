import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('save-file', { filePath, content }),
  saveFileDialog: (options: Electron.SaveDialogOptions | null) => ipcRenderer.invoke('save-file-dialog', options)
})