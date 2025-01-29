import { useState } from 'react'
import App from '../../App'

interface DocumentTab {
  id: number
  name: string
  content: string
  path: string | null
}

const Documents = () => {
  const [tabs, setTabs] = useState<DocumentTab[]>([])
  const [activeTab, setActiveTab] = useState<number | null>(null)
  const [tabApps, setTabApps] = useState<React.ReactElement[]>([])

  const createNewDocument = () => {
    const newTab: DocumentTab = { id: Date.now(), name: `Untitled ${tabs.length + 1}`, content: '{}', path: null }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
    setTabApps([...tabApps, <App key={newTab.id} />])
  }

  const openExistingDocument = async () => {
    const file = await window.electron.openFile()
    if (file) {
      const newTab: DocumentTab = { id: Date.now(), name: file.filePath.split('/').pop()!, content: file.content, path: file.filePath }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.id)
    }
  }

  const saveDocument = async () => {
    if (activeTab !== null) {
      const doc = tabs.find(t => t.id === activeTab)
      if (doc) {
        let filePath = doc.path

        if (!filePath) {
          const result = await window.electron.saveFileDialog()
          if (result?.filePath) {
            filePath = result.filePath
          } else {
            return
          }
        }

        await window.electron.saveFile(filePath, doc.content)
        setTabs(tabs.map(t => (t.id === activeTab ? { ...t, path: filePath, name: filePath.split('/').pop()! } : t)))
      }
    }
  }

  return (
    <div>
      <button onClick={createNewDocument}>New</button>
      <button onClick={openExistingDocument}>Open</button>
      <button onClick={saveDocument} disabled={activeTab === null}>Save</button>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'active' : ''}>
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab !== null && tabApps[activeTab] }
    </div>
  )
}

export default Documents
