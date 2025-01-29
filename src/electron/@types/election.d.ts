export interface ElectronAPI {
    openFile: () => Promise<{ filePath: string; content: string } | null>
    saveFile: (filePath: string, content: string) => Promise<string | null>
    saveFileDialog: () => Promise<{ filePath: string } | null>
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI
    }
  }
  
export {}
