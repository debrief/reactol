import { AutoComplete, Button, Col, Form, Row, Tooltip } from 'antd'
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
  UndoOutlined
} from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../state/hooks'
import { UndoModal } from '../UndoModal'
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
  const canUndo = useAppSelector(state => state.fColl.past.length > 0)
  const canRedo = useAppSelector(state => state.fColl.future.length > 0)
  const { time, setTime, viewportFrozen, setViewportFrozen, copyMapToClipboard, interval, setInterval } = useDocContext()
  const [undoModalVisible, setUndoModalVisible] = useState(false)
  const start = bounds ? bounds[0] : 0
  const end = bounds ? bounds[1] : 0
  const [stepTxt, setStepTxt] = useState<string>(StepOptions[2].value)
  const [filterApplied, setFilterApplied] = useState(false)

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

  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log('Invalid time format:' + err)
    }
  }, [stepTxt, setInterval])

  useEffect(() => {
    if (filterApplied) {
      const newStart = TimeSupport.roundDown(new Date(start), interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      const newTime = {
        ...time,
        start: newStart.getTime(),
        filterApplied: true,
        end: newEnd.getTime(),
      }
      setTime(newTime)
    } else {
      setTime({ ...time, start, end, filterApplied: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, start, end, filterApplied, setTime])

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
              onClick={() => setFilterApplied(value => !value)}
            >
              {time.filterApplied ? <FilterFilled /> : <FilterOutlined />}
            </Button>
          </Tooltip>
          <Tooltip placement='bottom' title={undoRedoTitle || 'Nothing to undo/redo'}>
            <Button
              style={buttonStyle}
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
              title='Copy map to clipboard'
              icon={<CopyOutlined />}
              disabled={!viewportFrozen}
            />
          </Tooltip>
        </Col>
      </Row>
      <Form disabled={!time.filterApplied}>
        <table
          style={{
            width: '100%'
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
      <UndoModal
        visible={undoModalVisible}
        onCancel={() => setUndoModalVisible(false)}
        onRestore={() => setUndoModalVisible(false)}
      />
    </>
  )
}

export default ControlPanel