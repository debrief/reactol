import { useState } from 'react'
import App from '../../App'
import { Button, Col, Dropdown, Image, Row, Space, Tabs, TabsProps, Typography } from 'antd'
import { DownOutlined } from '@ant-design/icons'

const Documents = () => {
  const [tabs, setTabs] = useState<NonNullable<TabsProps['items']>>([])
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)

  const createNewDocument = () => {
    console.log('create new document')
    const newTab = {
      key: '' + Date.now(),
      label: `Untitled ${tabs.length + 1}`,
      children: <App />,
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.key)
  }

  const openExistingDocument = async () => {
    const file = await window.electron.openFile()
    if (file) {
      // TODO give `App` a prop repsesenting the file content. It will
      // verify this is GeoJSON, and load it into the store.
      const newTab = {
        key: '' + Date.now(),
        label: file.filePath.split('/').pop()!,
        children: <App />,
      }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.key)
    }
  }

  // const saveDocument = async () => {
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
  // }

  const onTabChange = (key: string) => {
    setActiveTab(key)
  }

  function onEdit(
    e: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove'): void {
    console.log('edit', e, action)
    switch (action) {
    case 'add':
      createNewDocument()
      break
    case 'remove':
      setTabs(tabs.filter((t) => t.key !== e))
      break
    }
  }

  const dropdownItems = [
    {
      key: '1',
      label: 'New',
      onClick: () => createNewDocument(),
    },
    {
      key: '2',
      label: 'Open ...',
      onClick: () => openExistingDocument(),
    },
  ]

  const operations = (
    <Dropdown menu={{ items: dropdownItems }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space size='large'>
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  )

  return (
    <div>
      <Tabs
        tabBarExtraContent={operations}
        type='editable-card'
        hideAdd={true}
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabs}
        onEdit={onEdit}
      />
      {tabs.length === 0 && (
        <div style={{ paddingTop: '100px' }}>
          <Row>
            <Col span={24}><Typography.Title>Welcome to Albatross</Typography.Title></Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={12}>
              <Image width={200} src='images/albatross-flying.png' />
            </Col>
            <Col span={12}>
              <Row>
                <Col span={8}><Button onClick={createNewDocument} size='large' block type='primary'>New</Button></Col>
              </Row>
              <Row style={{paddingTop: '25px'}}>
                <Col span={8}><Button onClick={openExistingDocument} size='large' block type='primary'>Open</Button></Col>
              </Row>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}

export default Documents
