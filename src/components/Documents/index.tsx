import { ReactNode, useState, useRef, useEffect } from 'react'
import App from '../../App'
import type { InputRef } from 'antd'
import { Button, Col, Image, Row, Tabs, Typography, Modal, Space, Input, Tooltip, Alert } from 'antd'
import { CloseOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
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
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingPlus, setIsDraggingPlus] = useState(false)
  const [message, setMessage] = useState<{ title: string, severity: 'error' | 'warning' | 'info', message: string } | null>(null)
  const inputRef = useRef<InputRef | null>(null)
  
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
    if (window.electron) {
      const file = await window.electron.openFile()
      if (file) {
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileNameFor(file.filePath),
          children: <App filePath={file.filePath} content={file.content} />,
          path: file.filePath
        }
        setTabs([...tabs, newTab])
        setActiveTab(newTab.key)
      }
    } else {
      // allow local files to be loaded into browser session
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.geojson,.json'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const content = await file.text()
          const data = JSON.parse(content)
          
          if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
            throw new Error('File must contain a GeoJSON FeatureCollection or Feature')
          }

          const newTab: TabWithPath = {
            key: '' + Date.now(),
            label: file.name.split('.')[0],
            children: <App content={content} />,
            path: file.name
          }
          setTabs([...tabs, newTab])
          setActiveTab(newTab.key)
        } catch (error) {
          Modal.error({
            title: 'Invalid File',
            content: 'Problem loading file: ' + error,
          })
        }
      }

      input.click()
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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('over')
    // Only prevent default and show indicator if it's a file being dragged
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDragging(true)
    }
  }

  const handleDragOverPlus = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('over plus')
    // Only prevent default and show indicator if it's a file being dragged
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDraggingPlus(true)
    }
  }

  const handleDragLeave = () => {
    console.log('leave')
    setIsDragging(false)
    setIsDraggingPlus(false)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    setIsDraggingPlus(false)

    const files = event.dataTransfer.files

    if (files.length > 1) {
      setMessage({ title: 'Error', severity: 'warning', message: 'Only one file can be loaded at a time' })
      return
    }

    const file = files[0]
    
    // Check file extension
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.json') && !fileName.endsWith('.geojson')) {
      setMessage({ title: 'Error', severity: 'warning', message: 'Only .json and .geojson files are supported' })
      return
    }
    
    try {
      const content = await file.text()
      // Validate that the content is valid JSON
      try {
        const data = JSON.parse(content)
        if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
          throw new Error('File must contain a GeoJSON FeatureCollection or Feature')
        }
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: file.name.split('.')[0],
          children: <App content={content} />,
          path: file.name
        }
        setTabs([...tabs, newTab])
        setActiveTab(newTab.key)
      } catch (e) {
        setMessage({ title: 'Error', severity: 'error', message: 'The file content is not a valid JSON format. Please check the file and try again. ' + e })
        return
      }

    } catch (e) {
      console.error('Error handling file:', e)
      setMessage({ title: 'Error', severity: 'error', message: 'Failed to load file: ' + e })
    }
  }

  return (
    <div>
      {isDragging && <><div className="modal-back"/> <div className="drag-overlay">+</div></>}
      {!!message && (
        <Modal 
          title={message?.title} 
          open={!!message} 
          onCancel={() => setMessage(null)} 
          okType='primary' 
          onOk={() => setMessage(null)}
        >
          <Alert showIcon type={message?.severity} description={message?.message} />
        </Modal>
      )}
      { tabs.length > 0 && <Tabs
        tabBarExtraContent={tabBarExtras}
        type='editable-card'
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabs}
        addIcon={<Tooltip title='Create New Document' placement="bottom">
          <Button shape='circle' icon={<PlusOutlined />} variant={isDraggingPlus ? 'outlined' : 'solid'} onDragOver={handleDragOverPlus} onDragLeave={handleDragLeave} onDrop={handleDrop}  />
        </Tooltip>}
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
        <div style={{ paddingTop: '50px' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
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
