import { AutoComplete, Button, Col, Form, Row, Tooltip } from "antd"
import {
  CopyOutlined,
  StepBackwardOutlined,
  FastBackwardOutlined,
  StepForwardOutlined,
  FastForwardOutlined,
  FilterOutlined,
  LockFilled,
  UnlockOutlined,
  FilterFilled
} from "@ant-design/icons"
import React, { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { useAppContext } from "../../state/AppContext"
import { TimeSupport } from "../../helpers/time-support"

export interface TimeProps {
  bounds: [number, number] | null
}

export const StepOptions = [
  { value: "00h15m" },
  { value: "00h30m" },
  { value: "01h00m" },
  { value: "02h00m" },
  { value: "03h00m" },
  { value: "06h00m" },
]

const pf = (val: number) => format(new Date(val), "MMM ddHHmm'Z'")

const timeStr = (val: number | number[] | null, index?: number): string => {
  if (index !== undefined) {
    const arr = val as number[]
    return val ? pf(arr[index]) : "000000Z"
  } else {
    return val ? pf(val as number) : "000000Z"
  }
}

interface TimeButtonProps {
  tooltip: string
  icon: React.ReactNode
  forward: boolean
  large: boolean
}

const TimeControl: React.FC<TimeProps> = ({ bounds }) => {
  const { time, setTime, viewportFrozen, setViewportFrozen, copyMapToClipboard } = useAppContext()
  const start = bounds ? bounds[0] : 0
  const end = bounds ? bounds[1] : 0
  const [stepTxt, setStepTxt] = useState<string>(StepOptions[2].value)
  const [interval, setInterval] = useState<number>(0)

  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log("Invalid time format:" + err)
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
      ? "Copy snapshot of map to the clipboard"
      : "Lock the viewport in order to take a snapshot of the map"
  }, [viewportFrozen])

  const largeIcon = {
    fontSize: "1.5em",
    enabled: !time.filterApplied ? "disabled" : "enabled",
  }
  const buttonStyle = { margin: "0 5px" }

  return (
    <>
      {" "}
      <Row>
        <Col span={20} style={{ textAlign: "left" }}>
          <Tooltip
            mouseEnterDelay={0.8}
            title='Lock viewport to prevent accidental map movement'
          >
            <Button
              style={buttonStyle}
              color='primary'
              variant={viewportFrozen ? "solid" : "outlined"}
              onClick={toggleFreezeViewport}
            >
              {viewportFrozen ? <LockFilled /> : <UnlockOutlined />}
            </Button>
          </Tooltip>
          <Tooltip
            mouseEnterDelay={0.8}
            title={
              bounds
                ? "Enable time controls, to filter tracks by time"
                : "No time data available"
            }
          >
            <Button
              style={buttonStyle}
              disabled={bounds === null}
              color='primary'
              variant={time.filterApplied ? "solid" : "outlined"}
              onClick={() => setFilterApplied(!time.filterApplied)}
            >
              {time.filterApplied ? <FilterFilled /> : <FilterOutlined />}
            </Button>
          </Tooltip>
        </Col>
        <Col span={4}>
          <Tooltip title={copyTooltip}>
            <Button
              onClick={copyMapToClipboard}
              title='Copy map to clipboard'
              icon={<CopyOutlined />}
              disabled={viewportFrozen}
            />
          </Tooltip>
        </Col>
      </Row>
      <Form disabled={!time.filterApplied}>
        <table
          style={{
            width: "100%",
            backgroundColor: time.filterApplied ? "white" : "#f0f0f0",
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
            <tr style={{ fontFamily: "monospace" }}>
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
            <tr style={{ fontFamily: "monospace" }}>
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

export default TimeControl
