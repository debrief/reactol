import { AutoComplete, Button, Col, Form, Row, Tooltip, Modal, List, Switch } from 'antd'
import {
  CopyOutlined,
  StepBackwardOutlined,
  FastBackwardOutlined,
  StepForwardOutlined,
  FastForwardOutlined,
  FilterOutlined,
  LockFilled,
  UnlockOutlined,
  FilterFilled,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../state/hooks'
import { UNDO_ACTION, REDO_ACTION } from '../../state/store'
import React, { useEffect, useMemo, useState } from 'react'
import { useDocContext } from '../../state/DocContext'
import { TimeSupport } from '../../helpers/time-support'
import { formatInTimeZone } from 'date-fns-tz'
import { SampleDataLoader } from '../SampleDataLoader'
import { sampleItems } from '../../data/sampleItems'

export interface TimeProps {
  bounds: [number, number] | null
  handleSave: () => void
  isDirty: boolean
}

const StepOptions = [
  { value: '00h15m' },
  { value: '00h30m' },
  { value: '01h00m' },
  { value: '02h00m' },
  { value: '03h00m' },
  { value: '06h00m' },
]

const pf = (val: number) => formatInTimeZone(new Date(val), 'UTC', 'MMM ddHHmm\'Z\'')

const timeStr = (val: number | number[] | null, index?: number): string => {
  if (index !== undefined) {
    const arr = val as number[]
    return val ? pf(arr[index]) : '000000Z'
  } else {
    return val ? pf(val as number) : '000000Z'
  }
}

interface TimeButtonProps {
  tooltip: string
  icon: React.ReactNode
  forward: boolean
  large: boolean
}

const ControlPanel: React.FC<TimeProps> = ({ bounds, handleSave, isDirty }) => {
  const { time, setTime, viewportFrozen, setViewportFrozen, copyMapToClipboard, interval, setInterval } = useDocContext()
  const dispatch = useDispatch()
  const canUndo = useAppSelector(state => state.fColl.past.length > 0)
  const canRedo = useAppSelector(state => state.fColl.future.length > 0)
  const redoTitle = useAppSelector(state => state.fColl.future.length > 0 ? state.fColl.future[0].details?.redo : 'Nothing to redo')
  const start = bounds ? bounds[0] : 0
  const end = bounds ? bounds[1] : 0
  const [stepTxt, setStepTxt] = useState<string>(StepOptions[2].value)
  const [undoModalVisible, setUndoModalVisible] = useState(false)
  const [selectedUndoIndex, setSelectedUndoIndex] = useState<number | null>(null)
  const [previewUndoCount, setPreviewUndoCount] = useState(0)
  const [modalPosition, setModalPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hideViewportChanges, setHideViewportChanges] = useState(true)
  
  const { past, present, future } = useAppSelector(state => state.fColl)

  // Get the undo history from the redux store
  const undoHistory = useMemo(() => {
    const history = []
    // Add past items in reverse order (oldest first)
    for (let i = 0; i < past.length; i++) {
      const item = past[i]
      if (item.details?.undo) {
        const isViewportChange = item.details.undo.toLowerCase().includes('viewport')
        if (!hideViewportChanges || !isViewportChange) {
          history.unshift({
            description: item.details.undo,
            time: TimeSupport.formatDuration(new Date().getTime() - item.details.time),
            type: 'past',
            isViewportChange
          })
        }
      }
    }
    // Add present item
    if (present.details?.undo) {
      const isViewportChange = present.details.undo.toLowerCase().includes('viewport')
      if (!hideViewportChanges || !isViewportChange) {
        history.unshift({
          description: present.details.undo,
          time: TimeSupport.formatDuration(new Date().getTime() - present.details.time),
          type: 'present',
          isViewportChange
        })
      }
    }
    // Add future items (more recent changes that were undone)
    for (let i = 0; i < future.length; i++) {
      const item = future[i]
      if (item.details?.undo) {
        const isViewportChange = item.details.undo.toLowerCase().includes('viewport')
        if (!hideViewportChanges || !isViewportChange) {
          history.unshift({
            description: item.details.undo,
            time: TimeSupport.formatDuration(new Date().getTime() - item.details.time),
            type: 'future',
            isViewportChange
          })
        }
      }
    }
    return history
  }, [past, present, future, hideViewportChanges])

  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log('Invalid time format:' + err)
    }
  }, [stepTxt, setInterval])

  useEffect(() => {
    if (time.filterApplied) {
      const newStart = TimeSupport.roundDown(new Date(start), interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      const newTime = {
        ...time,
        start: newStart.getTime(),
        end: newEnd.getTime(),
      }
      setTime(newTime)
    } else {
      setTime({ ...time, start, end })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, start, end, time.filterApplied, setTime])

  const setFilterApplied = (applied: boolean) => {
    const newTime = { ...time, filterApplied: applied }
    setTime(newTime)
  }

  const doStep = (fwd: boolean, large: boolean) => {
    if (large) {
      const newStart = fwd
        ? TimeSupport.roundDown(new Date(end), interval)
        : TimeSupport.roundDown(new Date(start), interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      const newTime = {
        ...time,
        start: newStart.getTime(),
        end: newEnd.getTime(),
      }
      setTime(newTime)
    } else {
      const timeNow = new Date(time.start)
      const newStart = fwd
        ? TimeSupport.increment(timeNow, interval)
        : TimeSupport.decrement(timeNow, interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      if (newEnd.getTime() >= start && newStart.getTime() <= end) {
        const newTime = {
          ...time,
          start: newStart.getTime(),
          end: newEnd.getTime(),
        }
        setTime(newTime)
      }
    }
  }

  /** convenience component to make time button construction easier */
  const TimeButton: React.FC<TimeButtonProps> = ({
    tooltip,
    icon,
    forward,
    large,
  }) => {
    return (
      <Tooltip placement='bottom' mouseEnterDelay={0.5} title={tooltip}>
        <Button
          color='primary'
          variant='outlined'
          icon={icon}
          disabled={!time.filterApplied}
          onClick={() => doStep(forward, large)}
        />
      </Tooltip>
    )
  }

  const toggleFreezeViewport = () => {
    setViewportFrozen(!viewportFrozen)
  }

  const copyTooltip = useMemo(() => {
    return viewportFrozen
      ? 'Copy snapshot of map to the clipboard'
      : 'Lock the viewport in order to take a snapshot of the map'
  }, [viewportFrozen])

  const largeIcon = {
    fontSize: '1.5em',
    enabled: !time.filterApplied ? 'disabled' : 'enabled',
  }
  const buttonStyle = { margin: '0 5px' }

  const saveButton = useMemo(() => {
    return <Tooltip placement='bottom' title={isDirty ? 'Save changes' : 'Document unchanged'}>
      <Button onClick={handleSave} disabled={!isDirty} variant='outlined' >
        <SaveOutlined/>
      </Button>
    </Tooltip>
  }, [handleSave, isDirty])

  return (
    <>
      {' '}
      <Modal
        title={
          <div
            style={{ cursor: 'move', width: '100%' }}
            onMouseDown={(e) => {
              setIsDragging(true)
              const rect = e.currentTarget.getBoundingClientRect()
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              })
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setModalPosition({
                  x: e.clientX - dragOffset.x,
                  y: e.clientY - dragOffset.y
                })
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: '32px' }}>
              <span style={{ marginRight: '16px' }}>Select a point to undo to</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto',
                marginTop: '10px', marginRight:'30px'}}>
                <Switch
                  checkedChildren={'Hiding Viewport changes'}
                  unCheckedChildren={'Showing Viewport changes'}
                  size="small"
                  checked={hideViewportChanges}
                  onChange={(checked) => setHideViewportChanges(checked)}
                />
              </div>
            </div>
          </div>
        }
        style={{
          top: modalPosition.y,
          left: modalPosition.x,
          position: 'fixed'
        }}
        mask={false}
        open={undoModalVisible}
        onCancel={() => {
          // Reset preview if canceling
          for (let i = 0; i < previewUndoCount; i++) {
            dispatch({ type: REDO_ACTION })
          }
          setPreviewUndoCount(0)
          setSelectedUndoIndex(null)
          setUndoModalVisible(false)
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              // Reset preview if canceling
              for (let i = 0; i < previewUndoCount; i++) {
                dispatch({ type: REDO_ACTION })
              }
              setPreviewUndoCount(0)
              setSelectedUndoIndex(null)
              setUndoModalVisible(false)
            }}
          >
            Cancel
          </Button>,
          <Button
            key="restore"
            type="primary"
            disabled={selectedUndoIndex === null}
            onClick={() => {
              // Keep the changes but don't close the modal
              // Just clear the preview state so user can continue exploring
              setPreviewUndoCount(0)
              setSelectedUndoIndex(null)
              setUndoModalVisible(false)
            }}
          >
            Restore Version
          </Button>
        ]}
      >
        <List
          size="small"
          dataSource={undoHistory}
          renderItem={(item, index) => (
            <List.Item
              onClick={() => {
                if (index === selectedUndoIndex) {
                  // If clicking the same item again, treat it as deselection
                  for (let i = 0; i < previewUndoCount; i++) {
                    dispatch({ type: REDO_ACTION })
                  }
                  setPreviewUndoCount(0)
                  setSelectedUndoIndex(null)
                } else {
                  // First redo any existing preview
                  for (let i = 0; i < previewUndoCount; i++) {
                    dispatch({ type: REDO_ACTION })
                  }
                  // Then undo to the selected point
                  for (let i = 0; i < index + 1; i++) {
                    dispatch({ type: UNDO_ACTION })
                  }
                  setPreviewUndoCount(index + 1)
                  setSelectedUndoIndex(index)
                }
              }}
              style={{
                cursor: 'pointer',
                backgroundColor: index === selectedUndoIndex ? '#e6f7ff' : 
                  item.type === 'future' ? '#fff1f0' : undefined,
                padding: '8px 16px'
              }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto',
                gap: '24px',
                alignItems: 'center',
                width: '100%'
              }}>
                <div style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: item.type === 'future' ? '#cf1322' : undefined
                }}>
                  {index === 0 ? (
                    <strong>{item.description} (current state)</strong>
                  ) : (
                    item.description
                  )}
                </div>
                <div style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  whiteSpace: 'nowrap',
                  textAlign: 'right'
                }}>
                  {item.time}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Modal>
      <div
        onMouseMove={(e) => {
          if (isDragging) {
            setModalPosition({
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
            })
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <Row style={{padding: '2px'}}>
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
              title={
                bounds
                  ? 'Enable time controls, to filter tracks by time'
                  : 'No time data available'
              }
            >
              <Button
                style={buttonStyle}
                disabled={bounds === null}
                color='primary'
                variant={time.filterApplied ? 'solid' : 'outlined'}
                onClick={() => setFilterApplied(!time.filterApplied)}
              >
                {time.filterApplied ? <FilterFilled /> : <FilterOutlined />}
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
                onClick={() => dispatch({ type: REDO_ACTION })}
                icon={<RedoOutlined />}
                disabled={!canRedo}
              />
            </Tooltip>
            <SampleDataLoader sampleItems={sampleItems} />
            {saveButton}
          </Col>
          <Col span={4}>
            <Tooltip title={copyTooltip}>
              <Button
                onClick={copyMapToClipboard}
                title='Copy map to clipboard'
                icon={<CopyOutlined />}
                disabled={!viewportFrozen}
              />
            </Tooltip>
          </Col>
        </Row>
      </div>
      <Form disabled={!time.filterApplied}>
        <table
          style={{
            width: '100%',
            backgroundColor: time.filterApplied ? 'white' : '#f0f0f0',
          }}
        >
          <thead>
            <tr>
              <th>Start</th>
              <th>Step</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontFamily: 'monospace' }}>
              <td>{timeStr(time.start)}</td>
              <td>
                <AutoComplete
                  style={{ width: 100 }}
                  value={stepTxt}
                  onChange={(value) => setStepTxt(value)}
                  defaultOpen={false}
                  options={StepOptions}
                  placeholder='00h30m'
                />
              </td>
              <td>{timeStr(time.end)}</td>
            </tr>
            <tr style={{ fontFamily: 'monospace' }}>
              <td>
                <TimeButton
                  tooltip='Jump to start'
                  icon={<FastBackwardOutlined style={largeIcon} />}
                  forward={false}
                  large={true}
                />
                <TimeButton
                  tooltip='Step backward'
                  icon={<StepBackwardOutlined style={largeIcon} />}
                  forward={false}
                  large={false}
                />
              </td>
              <td></td>
              <td>
                <TimeButton
                  tooltip='Step forward'
                  icon={<StepForwardOutlined style={largeIcon} />}
                  forward={true}
                  large={false}
                />
                <TimeButton
                  tooltip='Jump to end'
                  icon={<FastForwardOutlined style={largeIcon} />}
                  forward={true}
                  large={true}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Form>
    </>
  )
}

export default ControlPanel
