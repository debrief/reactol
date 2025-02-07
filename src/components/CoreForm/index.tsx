import React, { useState, useCallback, useEffect } from 'react'
import { Button, Col, Flex, Row, Tooltip } from 'antd'
import { useDocContext } from '../../state/DocContext'

export interface CoreFormProps {
  children: React.ReactNode
  onReset: () => void
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
  formDirty?: boolean
  isCreate: boolean
  className?: string
}

export const CoreForm: React.FC<CoreFormProps> = ({children, onReset, onSave, onDelete, onCancel, formDirty, isCreate, className}) => {
  const [isExiting, setIsExiting] = useState(false)
  const { setEditableMapFeature } = useDocContext()

  const localOnSave = useCallback(() => {
    onSave()
    setEditableMapFeature(null)
  }, [onSave, setEditableMapFeature])

  const handleExit = useCallback((callback: () => void) => {
    setEditableMapFeature(null)
    setIsExiting(true)
    setTimeout(() => {
      setIsExiting(false)
      callback()
    }, 700) // Match the animation duration
  }, [setEditableMapFeature, setIsExiting])

  const handleCancel = useCallback(() => {
    handleExit(onCancel)
  }, [handleExit, onCancel])

  const handleDelete = useCallback(() => {
    handleExit(onDelete)
  }, [handleExit, onDelete])

  // Cleanup when component is unmounted
  useEffect(() => {
    return () => {
      setEditableMapFeature(null)
    }
  }, [setEditableMapFeature])

  return (
    <div style={{marginTop: '5px'}} className={`${className || ''} ${isExiting ? 'exit' : ''}`}>
      {children}
      <Row>
        <Col span={8}>
          <Tooltip title='Delete feature' placement="top">
            <Flex gap='small' justify='start' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
              <Button danger type='primary' disabled={isCreate} size='small' onClick={handleDelete}>Delete</Button>
            </Flex>
          </Tooltip>
        </Col>
        <Col span={16}>
          <Flex gap='small' justify='end' wrap style={{height: '1em', borderTop: '2px solid #ccc', paddingTop: '5px'}}>
            { isCreate && <Tooltip title='Cancel new feature creation' placement="top">
              <Button disabled={false} size='small' onClick={handleCancel}>Cancel</Button>
            </Tooltip> }
            { !isCreate && <Tooltip title='Reset changes for this feature' placement="top">
              <Button disabled={!formDirty} size='small' onClick={onReset}>Reset</Button>
            </Tooltip> }
            <Tooltip title='Save edits' placement="top">
              <Button type='primary' disabled={!formDirty} size='small' onClick={localOnSave}>{isCreate ? 'Create' : 'Save'}</Button>
            </Tooltip>
          </Flex> 
        </Col>
      </Row>
    </div>
  )
}