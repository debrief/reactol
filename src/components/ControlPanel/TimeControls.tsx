import React, { FC, useEffect, useState } from 'react'
import { AutoComplete, Button, Form, Tooltip } from 'antd'
import {
  StepBackwardOutlined,
  FastBackwardOutlined,
  StepForwardOutlined,
  FastForwardOutlined
} from '@ant-design/icons'
import { TimeSupport } from '../../helpers/time-support'
import { formatInTimeZone } from 'date-fns-tz'
import { useDocContext } from '../../state/DocContext'

interface TimeControlsProps {
  bounds: [number, number] | null
}

const StepOptions = [
  { value: '00h15m' },
  { value: '00h30m' },
  { value: '01h00m' },
  { value: '02h00m' },
  { value: '03h00m' },
  { value: '06h00m' },
]

const timeStr = (val: number | number[] | null, index?: number): string => {
  const pf = (val: number) => formatInTimeZone(new Date(val), 'UTC', 'MMM ddHHmm\'Z\'')
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
  doStep: (forward: boolean, large: boolean) => void
  disabled: boolean
}

/** convenience component to make time button construction easier */
const TimeButton: React.FC<TimeButtonProps> = ({
  tooltip,
  icon,
  forward,
  large,
  doStep,
  disabled
}) => {
  return (
    <Tooltip placement='bottom' mouseEnterDelay={0.5} title={tooltip}>
      <Button
        color='primary'
        variant='outlined'
        className={`${tooltip.toLowerCase().replace(/\s+/g, '-')}`}
        icon={icon}
        disabled={disabled}
        onClick={() => doStep(forward, large)}
      />
    </Tooltip>
  )
}

const TimeControls: FC<TimeControlsProps> = ({ bounds }) => {
  const { time, setTime,  interval, setInterval } = useDocContext()
  const [stepTxt, setStepTxt] = useState<string>('01h00m')

  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log('Invalid time format:' + err)
    }
  }, [stepTxt, setInterval])
  
  const start = bounds ? bounds[0] : 0
  const end = bounds ? bounds[1] : 0
  
  useEffect(() => {
    if (time.filterApplied) {
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
  }, [interval, start, end, time.filterApplied, setTime])

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
  const largeIcon = {
    fontSize: '1.5em',
    enabled: !time.filterApplied ? 'disabled' : 'enabled',
  }

  return (
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
            <td className='time-start-txt'>{timeStr(time.start)}</td>
            <td>
              <AutoComplete
                style={{ width: 100 }}
                className='time-step-input'
                value={stepTxt}
                onChange={(value) => setStepTxt(value)}
                defaultOpen={false}
                options={StepOptions}
                placeholder='00h30m'
              />
            </td>
            <td className='time-end-txt'>{timeStr(time.end)}</td>
          </tr>
          <tr style={{ fontFamily: 'monospace' }}>
            <td>
              <TimeButton
                tooltip='Jump to start'
                icon={<FastBackwardOutlined style={largeIcon} />}
                forward={false}
                large={true}
                doStep={doStep}
                disabled={!time.filterApplied}
              />
              <TimeButton
                tooltip='Step backward'
                icon={<StepBackwardOutlined style={largeIcon} />}
                forward={false}
                large={false}
                doStep={doStep}
                disabled={!time.filterApplied}
              />
            </td>
            <td></td>
            <td>
              <TimeButton
                tooltip='Step forward'
                icon={<StepForwardOutlined style={largeIcon} />}
                forward={true}
                large={false}
                doStep={doStep}
                disabled={!time.filterApplied}
              />
              <TimeButton
                tooltip='Jump to end'
                icon={<FastForwardOutlined style={largeIcon} />}
                forward={true}
                large={true}
                doStep={doStep}
                disabled={!time.filterApplied}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Form>
  )
}

export default TimeControls
