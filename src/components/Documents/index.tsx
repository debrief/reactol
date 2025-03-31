import { ReactNode, useRef, useMemo, useEffect, useCallback } from 'react'
import type { InputRef } from 'antd'
import { Button, Tooltip, Switch, Modal, Input, Space, Alert, Row, Col, Typography, Image } from 'antd'
import { FileAddOutlined, PlusOutlined, BulbOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { useAppContext } from '../../state/AppContext'
import { Layout, Model, TabNode, ITabSetRenderValues, TabSetNode, BorderNode, Actions, DockLocation } from 'flexlayout-react'
import './index.css'

// Import custom hooks
import { useFileHandling } from './hooks/useFileHandling'
import { useTabManagement } from './hooks/useTabManagement'

export type TabWithPath =  {
  key: string
  label: string
  children: ReactNode
}

const Documents = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext()
  
  const inputRef = useRef<InputRef | null>(null)
  const layoutRef = useRef<Layout | null>(null)
    
  // Dynamically import the appropriate flexlayout theme
  useEffect(() => {
    if (isDarkMode) {
      import('flexlayout-react/style/dark.css')
    } else {
      import('flexlayout-react/style/light.css')
    }
  }, [isDarkMode])
  
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

  const addTabToLayout = useCallback((newTab: TabWithPath) => {
    if (layoutModel) {
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
  }, [layoutModel])

  // This useEffect has been moved below after the hooks are declared

  // Get tab management hook first since we need setTabs
  const {
    tabs,
    tabToClose,
    newTabState,
    documentName,
    handleNew,
    handleOk,
    handleCancel,
    handleNameChange,
    handleCloseTabConfirm,
    handleCloseTabCancel,
    handleTabsAction,
    openExistingDocument,
    setTabs
  } = useTabManagement(addTabToLayout, layoutModel)

  // Use the file handling hook
  const {
    isDragging,
    message,
    setMessage,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useFileHandling(setTabs, addTabToLayout)

  const factory = (node: TabNode) => {
    const component = node.getComponent()
    const tab = tabs.find(tab => tab.key === component)
    return tab ? tab.children : null
  }

  // Tab management hook is now used above
  
  // Focus input when new tab modal is opened
  useEffect(() => {
    if (newTabState) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [newTabState])

  const onRenderTabSet = (_tabSetNode: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
    renderValues.buttons.push(<Tooltip title="New Tab" key={'new-tab-btn'}>
      <Button
        icon={<PlusOutlined />}
        size="small"
        onClick={() => handleNew()}>New</Button>
    </Tooltip>)
    renderValues.buttons.push(
      <Tooltip title="Open Existing Document" key="open-doc">
        <Button icon={<FileAddOutlined />} onClick={openExistingDocument} size="small" >Open</Button>
      </Tooltip>
    )
    renderValues.buttons.push(
      <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} key='theme-toggle'>
        <Switch
          checkedChildren={<BulbOutlined />}
          unCheckedChildren={<BulbOutlined />}
          checked={isDarkMode}
          onChange={toggleDarkMode}
          size="small"
          style={{ marginLeft: '8px' }}
        />
      </Tooltip>
    )
  }

  // handleTabsAction is now provided by the useTabManagement hook

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
        open={newTabState !== null}
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
                <Col span={6}></Col>
                <Col span={12}><Button onClick={() => handleNew(false)} size='large' type='primary'>New</Button><Button style={{fontStyle: 'italic', marginLeft: '10px'}} onClick={() => handleNew(true)} size='large' type='primary'>Sample plot</Button></Col>
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
