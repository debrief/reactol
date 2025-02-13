import { ReactNode, useState, useRef, useMemo, useEffect, useCallback } from 'react'
import App from '../../App'
import type { InputRef } from 'antd'
import { Button, Col, Image, Row, Typography, Modal, Space, Input, Tooltip, Alert } from 'antd'
import { ExclamationCircleFilled, FileAddOutlined, PlusOutlined } from '@ant-design/icons'
import {Layout, Model, TabNode, ITabSetRenderValues, TabSetNode, BorderNode, Action, Actions, DockLocation} from 'flexlayout-react'
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

const DEFAULT_DOC_NAME = 'Pending'

const Documents = () => {
  const [tabs, setTabs] = useState<NonNullable<TabWithPath>[]>([])
  const [tabToClose, setTabToClose] = useState<Action | null>(null)
  const [isTabNameModalVisible, setIsTabNameModalVisible] = useState(false)
  const [documentName, setDocumentName] = useState(DEFAULT_DOC_NAME)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<{ title: string, severity: 'error' | 'warning' | 'info', message: string } | null>(null)
  const inputRef = useRef<InputRef | null>(null)
  const layoutRef = useRef<Layout | null>(null)

  useEffect(() => {
    if (isTabNameModalVisible) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isTabNameModalVisible])

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Only prevent default and show indicator if it's a file being dragged
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDragging(true)
    }
  }

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [setIsDragging])

  const handleDrop = useCallback( async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

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
        if (layoutModel) {
          addTabToLayout(newTab, layoutModel)
        }
      } catch (e) {
        setMessage({ title: 'Error', severity: 'error', message: 'The file content is not a valid JSON format. Please check the file and try again. ' + e })
        return
      }

    } catch (e) {
      console.error('Error handling file:', e)
      setMessage({ title: 'Error', severity: 'error', message: 'Failed to load file: ' + e })
    }
  }, [setMessage, tabs])
  
  const layoutModel = useMemo(() => {
    const model = {
      global: { tabEnableClose: true },
      layout: {
        type: 'row',
        children: [ ],
      },
    }
    return Model.fromJson(model)
  }, [])

  const factory = (node: TabNode) => {
    const component = node.getComponent()
    const tab = tabs.find(tab => tab.key === component)
    return tab ? tab.children : null
  }

  const handleOk = () => {
    setIsTabNameModalVisible(false)
    const newTab: TabWithPath = {
      key: '' + Date.now(),
      label: documentName,
      children: <App />,
      path: documentName
    }
    if (layoutModel) {
      addTabToLayout(newTab, layoutModel)
    }
    setTabs([...tabs, newTab])
    setDocumentName(DEFAULT_DOC_NAME)
  }

  const addTabToLayout = (newTab: TabWithPath, layoutModel: Model) => {
    const tabSetNode = layoutModel.getRoot().getChildren()[0]
    
    if (tabSetNode) {
      layoutModel.doAction(
        Actions.addNode(
          {
            type: 'tab',
            name: newTab.label,
            component: newTab.key, 
            id: newTab.key 
          },
          tabSetNode.getId(),
          DockLocation.CENTER,
          0
        )
      )
    }
  }
  
  const handleNew = async () => {
    if (window.electron) {
      const options = { 
        title: 'New document', 
        filters: [{ name: 'GeoJSON Files', extensions: ['geojson', 'json'] }] 
      }
      const result = await window.electron.saveFileDialog(options)
  
      if (result?.filePath) {
        const filePath = result.filePath
        const fileName = fileNameFor(filePath)
  
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileName,
          children: <App filePath={filePath} />, 
          path: filePath
        }
        setTabs([...tabs, newTab])
        if (layoutModel) {
          addTabToLayout(newTab, layoutModel)
        }
      } else {
        console.log('Cancelled')
        return
      }
    } else {
      setIsTabNameModalVisible(true)
    }
  }

  const handleCancel = () => {
    setDocumentName(DEFAULT_DOC_NAME)
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
        if (layoutModel) {
          addTabToLayout(newTab, layoutModel)
        }
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
          if (layoutModel) {
            addTabToLayout(newTab, layoutModel)
          }
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
  
  const handleCloseTabConfirm = () => {
    if (tabToClose) {
      layoutModel.doAction(tabToClose)
      setTabToClose(null)
      const tabToCloseNode = tabToClose.data.node
      setTabs(prevTabs => prevTabs.filter(tab => tab.key !== tabToCloseNode))
    }
  }

  const handleCloseTabCancel = () => {
    setTabToClose(null)
  }

  const onRenderTabSet = (_tabSetNode: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
    renderValues.buttons.push(<Tooltip title="New Tab" key={'new-tab-btn'}>
      <Button
        icon={<PlusOutlined />}
        size="small"
        onClick={() => handleNew()}>New</Button>
    </Tooltip>)
    renderValues.buttons.push(
      <Tooltip title="Open Existing Document" key="open-doc">
        <Button  icon={<FileAddOutlined />} onClick={openExistingDocument} size="small" >Open</Button>
      </Tooltip>
    )
  }

  const handleTabsAction = (action: Action): undefined | Action => {
    if (action.type.includes('DeleteTab')) {
      // ok, use the modal to double-check the 
      // user wants to save
      setTabToClose(action)
      // now return undefined, so the close doesn't (yet) close
      return undefined
    }
    return action
  }

  //  console.log('tabs', tabs)

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
      { 
        tabs.length > 0 && <Layout
          ref={layoutRef}
          model={layoutModel}
          factory={factory}
          onAction={handleTabsAction}
          onRenderTabSet={onRenderTabSet}
        />
      }
      <Modal
        title="Please provide a name for the document"
        open={isTabNameModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          ref={inputRef}
          value={documentName}
          onChange={handleNameChange}
          onPressEnter={handleOk}
          onFocus={(e) => e.target.select()}
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
