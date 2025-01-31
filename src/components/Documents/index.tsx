import { ReactNode, useState } from 'react'
import App from '../../App'
import { Button, Col, Image, Row, Tabs, Typography, Modal, Space, Input, Tooltip } from 'antd'
import { CloseOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import './index.css'

type TabWithPath =  {
  key: string
  label: string
  children: ReactNode
  path: string
} 

const Documents = () => {
  const [tabs, setTabs] = useState<NonNullable<TabWithPath>[]>([])
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [tabToClose, setTabToClose] = useState<string | null>(null)
  const [isTabNameModalVisible, setIsTabNameModalVisible] = useState(false)
  const [documentName, setDocumentName] = useState('')

  const handleOk = () => {
    setIsTabNameModalVisible(false)
    const newTab: TabWithPath = {
      key: '' + Date.now(),
      label: documentName,
      children: <App />,
      path: documentName
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.key)
    setDocumentName('')
  }

  const handleNew = async () => {
    // are we an electron app?
    if (window.electron) {
      const result = await window.electron.saveFileDialog()
      if (result?.filePath) {
        const path = result.filePath
        const fileName = path.split('/').pop()!
        const fileNameWithoutExtension = fileName.split('.')[0]
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileNameWithoutExtension,
          children: <App />,
          path: result?.filePath
        }
        setTabs([...tabs, newTab])
        setActiveTab(newTab.key)
      } else {
        console.log('cancelled')
        return
      }
    } else {
      // conventional app - get doc name
      setIsTabNameModalVisible(true)
    }
  }

  const handleCancel = () => {
    setDocumentName('')
    setIsTabNameModalVisible(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value)
  }

  const openExistingDocument = async () => {
    const file = await window.electron.openFile()
    if (file) {
      // TODO give `App` a prop repsesenting the file content. It will
      // verify this is GeoJSON, and load it into the store.
      const newTab: TabWithPath = {
        key: '' + Date.now(),
        label: file.filePath.split('/').pop()!,
        children: <App content={file.content} />,
        path: file.filePath
      }

      // dispatch({ type: 'fColl/featuresUpdated', payload: features })
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

  function onTabsEdit(
    e: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove'): void {
    switch (action) {
    case 'add':
      setIsTabNameModalVisible(true)
      break
    case 'remove':
      if (typeof e === 'string') {
        setTabToClose(e)
      }
      break
    }
  }

  const handleCloseTabConfirm = () => {
    if (tabToClose) {
      setTabs(tabs.filter((t) => t.key !== tabToClose))
      setTabToClose(null)
    }
  }

  const handleCloseTabCancel = () => {
    setTabToClose(null)
  }

  const tabBarExtras = {
    left: <Image className='logo-image' alt='Application logo - albatross flying' preview={false} width={30} src='images/albatross-flying.png' />,
    right: <Tooltip title='Open Existing Document' placement="bottom"><Button onClick={() => openExistingDocument()}>Open</Button></Tooltip>
  }

  return (
    <div>
      { tabs.length > 0 && <Tabs
        tabBarExtraContent={tabBarExtras}
        type='editable-card'
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabs}
        addIcon={<Tooltip title='Create New Document' placement="bottom"><Button shape='circle' icon={<PlusOutlined />} /></Tooltip>}
        removeIcon={<Tooltip title='Close Document' placement="bottom"><Button size='small' variant='text' type='text' icon={<CloseOutlined />} /></Tooltip>}
        onEdit={onTabsEdit}
      />}
      <Modal
        title="Please provide a name for the document"
        open={isTabNameModalVisible}
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
        onOk={handleCloseTabConfirm}
        onCancel={handleCloseTabCancel}
        okText="Close"
        cancelText="Cancel"
      >
        <Space>
          <ExclamationCircleFilled style={{ color: '#faad14', fontSize: '22px' }} />
          <p>Are you sure you want to close this tab?</p>
        </Space>
      </Modal>
      {tabs.length === 0 && (
        <div style={{ paddingTop: '50px' }}>
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
              <Row style={{ paddingBottom: '12px' }}>
                <Col span={6}>&nbsp;</Col>
                <Col span={12}><Typography.Text type='secondary'>Open an existing document or create a new one</Typography.Text></Col>
              </Row>
              <Row>
                <Col span={8}></Col>
                <Col span={8}><Button onClick={handleNew} size='large' block type='primary'>New</Button></Col>
              </Row>
              <Row style={{ paddingTop: '25px' }}>
                <Col span={8}></Col>
                <Col span={8}><Button onClick={openExistingDocument} size='large' block type='primary'>Open</Button></Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={24}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={6}>&nbsp;</Col>
            <Col span={12}><Typography.Text type='secondary'>Background on the tool, who to contact for support. Background on the tool, who to contact for support. Background on the tool, who to contact for support. Background on the tool, who to contact for support. Background on the tool, who to contact for support. Background on the tool, who to contact for support. </Typography.Text></Col>
          </Row>
        </div>
      )}
    </div>
  )
}

export default Documents
