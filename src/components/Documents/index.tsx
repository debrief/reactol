import { Key, useState } from 'react'
import App from '../../App'
import { Tabs, TabsProps } from 'antd'

const Documents = () => {
  const [tabs, setTabs] = useState<TabsProps['items']>([])
  const [activeTab, setActiveTab] = useState<Key | null>(null)

  const createNewDocument = () => {
    if (!tabs) {
      return
    }
    const newTab = { key: '' + Date.now(), label: `Untitled ${tabs.length + 1}`, children: <App/> }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.key)
  }

  const openExistingDocument = async () => {
    const file = await window.electron.openFile()
    if (file && tabs) {
      // TODO give `App` a prop repsesenting the file content. It will
      // verify this is GeoJSON, and load it into the store.
      const newTab = { key: '' + Date.now(), label: file.filePath.split('/').pop()!, children: <App/> }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.key)
    }
  }

  const saveDocument = async () => {
    // if (activeTab !== null) {
    //   const doc = tabs.find(t => t.id === activeTab)
    //   if (doc) {
    //     let filePath = doc.path

    //     if (!filePath) {
    //       const result = await window.electron.saveFileDialog()
    //       if (result?.filePath) {
    //         filePath = result.filePath
    //       } else {
    //         return
    //       }
    //     }

    //     await window.electron.saveFile(filePath, doc.content)
    //     setTabs(tabs.map(t => (t.id === activeTab ? { ...t, path: filePath, name: filePath.split('/').pop()! } : t)))
    //   }
    // }
  }

  const onTabChange = (key: string) => {
    setActiveTab(key)
  }

  return (
    <div>
      <button onClick={createNewDocument}>New</button>
      <button onClick={openExistingDocument}>Open</button>
      <button onClick={saveDocument} disabled={activeTab === null}>Save</button>

      <Tabs onChange={onTabChange} items={tabs} />

    </div>
  )
}

export default Documents
