import { AutoComplete, Button, Checkbox, Col, Form, Row } from "antd";
import {
  CopyOutlined,
  StepBackwardOutlined,
  FastBackwardOutlined,
  StepForwardOutlined,
  FastForwardOutlined,
  FilterOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { format } from 'date-fns';
import { useAppContext } from "../context/AppContext";
import { TimeSupport } from "../helpers/time-support";

export interface TimeProps {
  start: number // earliest time in data
  end: number // latest time in data
}

export const StepOptions = [
  { value: "00h15m" },
  { value: "00h30m" },
  { value: "01h00m" },
  { value: "02h00m" },
  { value: "03h00m" },
  { value: "06h00m" }
]

const pf = (val: number) => format(new Date(val), "ddHHmm'Z'")
  
const timeStr = (val: number | number[] | null, index?: number): string => {
  if (index !== undefined) {
    const arr = val as number[]
    return val ? pf(arr[index]) : '000000Z'
  } else {
    return val ? pf(val as number) : '000000Z'
  }
}

const TimeControl: React.FC<TimeProps> = ({start, end}) => {
  const { time, setTime } = useAppContext();

  const [stepTxt, setStepTxt] = useState<string>(StepOptions[1].value);
  const [interval, setInterval] = useState<number>(0);

  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log('Invalid time format:' + err)
    }
  }, [stepTxt, setInterval])

  useEffect(() => {
    const newStart = TimeSupport.roundDown(new Date(start), interval)
    const newEnd = TimeSupport.increment(newStart, interval)
    const newTime = {...time, start: newStart.getTime(), end: newEnd.getTime()}
    setTime(newTime)
}, [interval, start, end])

  const setFilterApplied = (applied: boolean) => {
    const newTime = {...time, filterApplied: applied}
    setTime(newTime)
  }

  const copyMapToClipboard = (): void => {
    window.alert('Map copied to clipboard')
  }

  const doStep = (fwd: boolean, large: boolean) => {
    if (large) {
      const newStart = fwd ? TimeSupport.roundDown(new Date(end), interval) : TimeSupport.roundDown(new Date(start), interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      const newTime = {...time, start: newStart.getTime(), end: newEnd.getTime()}
      setTime(newTime)
    } else {
      const timeNow = new Date(time.start)
      const newStart = fwd ? TimeSupport.increment(timeNow, interval) : TimeSupport.decrement(timeNow, interval)
      const newEnd = TimeSupport.increment(newStart, interval)
      if (newEnd.getTime() >= start && newStart.getTime() <= end) {
        const newTime = {...time, start: newStart.getTime(), end: newEnd.getTime()}
        setTime(newTime)
      }
    }
  }

  const largeIcon = { fontSize: '1.5em', enabled: !time.filterApplied ? 'disabled' : 'enabled' }

  return (
    <>  <Row>
          <Col span={16} style={{textAlign: 'left'}}>
            <Checkbox disabled={true} onChange={() => console.log('Lock viewport')}><ExpandOutlined/>Lock viewport</Checkbox>
            <Checkbox checked={time.filterApplied} onChange={() => setFilterApplied(!time.filterApplied)}><FilterOutlined/>Apply time filter</Checkbox>
          </Col>
          <Col span={4}>
          </Col>
          <Col span={4}>
            <Button onClick={copyMapToClipboard} icon={<CopyOutlined/>} />
          </Col>
         </Row>
         <Form disabled={!time.filterApplied}>
         <table style={{width: '100%', backgroundColor: time.filterApplied ? 'white' : '#f0f0f0'}}>
         <thead>
          <tr>
            <th>Start</th>
            <th>Step</th>
            <th>End</th>
          </tr>
          </thead>
          <tbody>
            <tr style={{fontFamily: 'monospace'}}>
              <td>{timeStr(time.start)}</td>
              <td><AutoComplete
                style={{ width:100 }}
                value={stepTxt}
                onChange={(value, _option) => setStepTxt(value)}
                defaultOpen={false}
                options={StepOptions}
                placeholder='00h30m'
              /></td>
              <td>{timeStr(time.end)}</td>
            </tr>
            <tr style={{fontFamily: 'monospace'}}>
              <td>
                <Button title="Jump to start" icon={<FastBackwardOutlined style={largeIcon}/>} disabled={!time.filterApplied} onClick={() => doStep(false, true)}/>
                <Button title="Step backard" icon={<StepBackwardOutlined style={largeIcon}/>} disabled={!time.filterApplied} onClick={() => doStep(false, false)}/> </td>
              <td></td>
              <td>
                <Button title="Step forward" icon={<StepForwardOutlined style={largeIcon}/>} disabled={!time.filterApplied} onClick={() => doStep(true, false)}/>
                <Button title="Jump to end" icon={<FastForwardOutlined style={largeIcon}/>} disabled={!time.filterApplied} onClick={() => doStep(true, true)}/>
              </td>
            </tr>
          </tbody>
      </table>
      </Form>
    </>
  );
};

export default TimeControl
