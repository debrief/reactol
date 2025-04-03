import { Button, Col, Row, Tooltip } from 'antd'
import {
  CopyOutlined,
  FilterOutlined,
  LockFilled,
  UnlockOutlined,
  FilterFilled,
  SaveOutlined,
  UndoOutlined
} from '@ant-design/icons'
import TimeControls from './TimeControls'
import React, { useMemo, useState } from 'react'
import { useAppSelector } from '../../state/hooks'
import { UndoModal } from '../UndoModal'
import { useDocContext } from '../../state/DocContext'


import { SampleDataLoader } from '../SampleDataLoader'
import { sampleItems } from '../../data/sampleItems'

export interface TimeProps {
  bounds: [number, number] | null
  handleSave: () => void
  isDirty: boolean
}



const ControlPanel: React.FC<TimeProps> = ({ bounds, handleSave, isDirty }) => {
  const canUndo = useAppSelector(state => state.fColl.past.length > 1)
  const canRedo = useAppSelector(state => state.fColl.future.length > 0)
  const { viewportFrozen, setViewportFrozen, copyMapToClipboard, time, setTime } = useDocContext()
  const [undoModalVisible, setUndoModalVisible] = useState(false)

  const undoRedoTitle = useMemo(() => {
    if(canUndo && canRedo) {
      return 'Undo/Redo ...'
    } else if (canUndo) {
      return 'Undo ...'
    } else if (canRedo) {
      return 'Redo ...'
    } else {
      return null
    }
  }, [canUndo, canRedo])

  const toggleFreezeViewport = () => {
    setViewportFrozen(!viewportFrozen)
  }

  const copyTooltip = useMemo(() => {
    return viewportFrozen
      ? 'Copy snapshot of map to the clipboard'
      : 'Lock the viewport in order to take a snapshot of the map'
  }, [viewportFrozen])

  const toggleFilterApplied = () => {
    setTime(prevTime => ({ ...prevTime, filterApplied: !prevTime.filterApplied }))
  }

  const buttonStyle = { margin: '0 5px' }

  const saveButton = useMemo(() => {
    return <Tooltip placement='bottom' title={isDirty ? 'Save changes' : 'Document unchanged'}>
      <Button onClick={handleSave} disabled={!isDirty} variant='outlined' >
        <SaveOutlined/>
      </Button>
    </Tooltip>
  }, [handleSave, isDirty])

  const enableTip = useMemo(() => {
    return bounds
      ? 'Enable time controls, to filter tracks by time'
      : 'No time data available'
  }, [bounds])

  return (
    <>
      {' '}
      
      <Row style={{padding: '2px 0px'}}>
        <Col span={20} style={{ textAlign: 'left' , display: 'flex', alignItems: 'center'}}>
          <Tooltip
            mouseEnterDelay={0.8}
            title='Lock viewport to prevent accidental map movement. When time filtering, mouse wheel updates time'
          >
            <Button
              style={buttonStyle}
              color='primary'
              variant={viewportFrozen ? 'solid' : 'outlined'}
              onClick={toggleFreezeViewport}
            >
              {viewportFrozen ? <LockFilled /> : <UnlockOutlined />}
            </Button>
          </Tooltip>
          <Tooltip
            mouseEnterDelay={0.8}
            title={enableTip}
          >
            <Button
              style={buttonStyle}
              disabled={bounds === null}
              className='apply-time-filter'
              color='primary'
              variant={time.filterApplied ? 'solid' : 'outlined'}
              onClick={() => toggleFilterApplied()}
            >
              {time.filterApplied ? <FilterFilled /> : <FilterOutlined />}
            </Button>
          </Tooltip>
          <Tooltip placement='bottom' title={undoRedoTitle || 'Nothing to undo/redo'}>
            <Button
              style={buttonStyle}
              className='undo-redo-button'
              onClick={() => setUndoModalVisible(true)}
              disabled={!undoRedoTitle}
            ><UndoOutlined /></Button>
          </Tooltip>
          <SampleDataLoader sampleItems={sampleItems} />
          {saveButton}
        </Col>
        <Col span={4}>
          <Tooltip title={copyTooltip}>
            <Button
              onClick={copyMapToClipboard}
              className='copy-map-to-clipboard'
              title='Copy map to clipboard'
              icon={<CopyOutlined />}
              disabled={!viewportFrozen}
            />
          </Tooltip>
        </Col>
      </Row>
      <TimeControls 
        bounds={bounds}
      />
      <UndoModal
        visible={undoModalVisible}
        onCancel={() => setUndoModalVisible(false)}
        onRestore={() => setUndoModalVisible(false)}
      />
    </>
  )
}

export default ControlPanel