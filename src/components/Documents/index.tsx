import { useState } from 'react'
import App from '../../App'
import { Button, Col, Image, Row, Tabs, TabsProps, Typography, Modal, Space, Input } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'

const Documents = () => {
  const [tabs, setTabs] = useState<NonNullable<TabsProps['items']>>([])
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [tabToClose, setTabToClose] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [documentName, setDocumentName] = useState('')

  const handleOk = () => {
    setIsModalVisible(false)
    const newTab = {
      key: '' + Date.now(),
      label: documentName,
      children: <App />,
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.key)
    setDocumentName('')
  }

  const handleCancel = () => {
    setDocumentName('')
    setIsModalVisible(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value)
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
      setIsModalVisible(true)
      break
    case 'remove':
      if (typeof e === 'string') {
        setTabToClose(e)
      }
      break
    }
  }

  const handleCloseConfirm = () => {
    if (tabToClose) {
      setTabs(tabs.filter((t) => t.key !== tabToClose))
      setTabToClose(null)
    }
  }

  const handleCloseCancel = () => {
    setTabToClose(null)
  }

  const operations = <Button type='primary' onClick={() => openExistingDocument()}>Open</Button>

  return (
    <div>
      { tabs.length > 0 && <Tabs
        tabBarExtraContent={operations}
        type='editable-card'
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabs}
        onEdit={onEdit}
      />}
      <Modal
        title="Create New Document"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder="Enter document name"
          value={documentName}
          onChange={handleNameChange}
          onPressEnter={handleOk}
        />
      </Modal>
      <Modal
        title="Close Tab"
        open={tabToClose !== null}
        onOk={handleCloseConfirm}
        onCancel={handleCloseCancel}
        okText="Close"
        cancelText="Cancel"
      >
        <Space>
          <ExclamationCircleFilled style={{ color: '#faad14', fontSize: '22px' }} />
          <p>Are you sure you want to close this tab?</p>
        </Space>
      </Modal>
      {tabs.length === 0 && (
        <div style={{ paddingTop: '100px' }}>
          <Row>
            <Col span={24}><Typography.Title>Welcome to Albatross</Typography.Title></Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row align='middle' justify='start'>
            <Col span={12}>
              <Image alt='Application logo - albatross flying' preview={false} width={200} src='images/albatross-flying.png' />
            </Col>
            <Col span={12}>
              <Row>
                <Col span={8}></Col>
                <Col span={8}><Button onClick={() => setIsModalVisible(true)} size='large' block type='primary'>New</Button></Col>
              </Row>
              <Row style={{ paddingTop: '25px' }}>
                <Col span={8}></Col>
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
