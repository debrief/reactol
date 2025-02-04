import { ReactNode, useState, useRef, useEffect } from 'react'
import App from '../../App'
import { Button, Col, Image, Row, Typography, Modal, Space, Input, Tooltip } from 'antd'
import { CloseOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import { Layout, Model, TabNode } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import './index.css'

type TabWithPath =  {
  key: string
  label: string
  children: ReactNode
  path: string
} 

const fileNameFor = (filePath: string): string => {
  const path = filePath
  const fileName = path.split('/').pop()!
  const fileNameWithoutExtension = fileName.split('.')[0]
  return fileNameWithoutExtension
}

const Documents = () => {
  const [tabs, setTabs] = useState<NonNullable<TabWithPath>[]>([])
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
  const [tabToClose, setTabToClose] = useState<string | null>(null)
  const [isTabNameModalVisible, setIsTabNameModalVisible] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const inputRef = useRef<InputRef | null>(null)
  const layoutRef = useRef<Layout | null>(null)
  
  useEffect(() => {
    if (isTabNameModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isTabNameModalVisible])

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
      const options = { title: 'New document', 
        filters: [{ name: 'GeoJSON Files', extensions: ['geojson', 'json'] }] }
      const result = await window.electron.saveFileDialog(options)
      if (result?.filePath) {
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileNameFor(result?.filePath),
          children: <App filePath={result?.filePath} />,
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
        label: fileNameFor(file.filePath),
        children: <App filePath={file.filePath} content={file.content} />,
        path: file.filePath
      }

      setTabs([...tabs, newTab])
      setActiveTab(newTab.key)
    }
  }

  const onTabChange = (key: string) => {
    setActiveTab(key)
  }

  function onTabsEdit(
    e: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove'): void {
    switch (action) {
    case 'add':
      handleNew()
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

  const layoutModel = useMemo(() => {
    const model = {
      global: {},
      layout: {
        type: 'row',
        children: [
          {
            type: 'tabset',
            weight: 100,
            children: tabs.map(tab => ({
              type: 'tab',
              name: tab.label,
              component: tab.key,
            })),
          },
        ],
      },
    }
    return Model.fromJson(model)
  }, [tabs])

  const factory = (node: TabNode) => {
    const component = node.getComponent()
    const tab = tabs.find(tab => tab.key === component)
    return tab ? tab.children : null
  }

  return (
    <div>
      { tabs.length > 0 && <Layout
        ref={layoutRef}
        model={layoutModel}
        factory={factory}
      />}
      <Modal
        title="Please provide a name for the document"
        open={isTabNameModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          ref={inputRef}
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
