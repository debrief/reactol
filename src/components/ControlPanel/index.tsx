import { Button, Col, Row, Tooltip } from 'antd'
import {
  LockFilled,
  UnlockOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../state/hooks'
import React, { useState } from 'react'
import { useDocContext } from '../../state/DocContext'
import { UndoModal } from '../UndoModal'

export interface TimeProps {
  bounds: [number, number] | null
  handleSave: () => void
  isDirty: boolean
}



const ControlPanel: React.FC<TimeProps> = ({ handleSave, isDirty }) => {
  const dispatch = useDispatch()
  const canUndo = useAppSelector(state => state.fColl.past.length > 0)
  const canRedo = useAppSelector(state => state.fColl.future.length > 0)
  const redoTitle = useAppSelector(state => state.fColl.future.length > 0 ? state.fColl.future[0].details?.redo : 'Nothing to redo')
  const [undoModalVisible, setUndoModalVisible] = useState(false)
  const { viewportFrozen, setViewportFrozen } = useDocContext()







  const toggleFreezeViewport = () => {
    setViewportFrozen(!viewportFrozen)
  }



  const buttonStyle = { margin: '0 5px' }

  const saveButton = (
    <Tooltip placement='bottom' title={isDirty ? 'Save changes' : 'Document unchanged'}>
      <Button onClick={handleSave} disabled={!isDirty} variant='outlined'>
        <SaveOutlined/>
      </Button>
    </Tooltip>
  )

  return (
    <>
      <UndoModal
        visible={undoModalVisible}
        onCancel={() => setUndoModalVisible(false)}
        onRestore={() => setUndoModalVisible(false)}
      />
      <div>
        <Row style={{padding: '2px'}}>
          <Col span={20} style={{ textAlign: 'left' , display: 'flex', alignItems: 'center'}}>
            <Tooltip
              mouseEnterDelay={0.8}
              title='Lock viewport to prevent accidental map movement'
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
            <Tooltip placement='bottom' title={canUndo ? 'Undo...' : 'Nothing to undo'}>
              <Button
                style={buttonStyle}
                onClick={() => setUndoModalVisible(true)}
                icon={<UndoOutlined />}
                disabled={!canUndo}
              />
            </Tooltip>
            <Tooltip placement='bottom' title={canRedo ? redoTitle : 'Nothing to redo'}>
              <Button
                style={buttonStyle}
                onClick={() => dispatch({ type: 'fColl/redo' })}
                icon={<RedoOutlined />}
                disabled={!canRedo}
              />
            </Tooltip>
            {saveButton}
          </Col>
        </Row>
      </div>
    </>
  )
}

export default ControlPanel
