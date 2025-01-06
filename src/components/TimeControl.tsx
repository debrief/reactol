import { AutoComplete, Button, Col, Form, Row } from "antd";
import { FilterOutlined, FilterFilled, CopyOutlined, StepBackwardOutlined, FastBackwardOutlined, StepForwardOutlined, FastForwardOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { format } from 'date-fns';
import { useAppContext } from "../context/AppContext";

export interface TimeProps {
  start: number
  end: number
  current?: number
  onTimeFilterChange?: (timePeriod: string) => void
}

export const StepOptions = [
  { value: "00h15m" },
  { value: "00h30m" },
  { value: "01h00m" },
  { value: "02h00m" },
  { value: "03h00m" },
  { value: "06h00m" }
]

const steps = 100


const unscaled = (start: number, end: number, value: number): number => {
  const range = end - start
  return (value / steps) * range + start
}

const pf = (val: number) => format(new Date(val), "ddHHmm'Z'")
  
const timeStr = (val: number | number[] | null, index?: number): string => {
  if (index !== undefined) {
    const arr = val as number[]
    return val ? pf(arr[index]) : '000000Z'
  } else {
    return val ? pf(val as number) : '000000Z'
  }
}

const TimeControl: React.FC<TimeProps> = ({start, end, onTimeFilterChange}) => {
  const { time, setTime } = useAppContext();

  const [value, setValue] = useState<{ start: number, end: number }>({ start: 0, end: steps });
  const [stepTxt, setStepTxt] = useState<string>(StepOptions[1].value);

  useEffect(() => {
    const val = { start: 0, end: steps }
    setValue(val)
  }, [start, end])

  const setNewValue = (value: number | number[]) => {
    if (!Array.isArray(value)) {
      throw new Error('Expected an array to time control')
    }
    const newValue = { start: value[0], end: value[1] }
    const unscaledValues = {
      start: unscaled(start, end, newValue.start),
      step: stepTxt,
      end: unscaled(start, end, newValue.end),
      filterApplied: time.filterApplied
    }
    setTime(unscaledValues)
    setValue(newValue)
    if (onTimeFilterChange) {
      const formattedTimePeriod = `${pf(unscaledValues.start)} - ${pf(unscaledValues.end)}`;
      onTimeFilterChange(formattedTimePeriod);
    }
  }

  const setFilterApplied = (applied: boolean) => {
    const newTime = {...time, filterApplied: applied}
    setTime(newTime)
  }

  const copyMapToClipboard = (): void => {
    window.alert('Map copied to clipboard')
  }

  const doStep = (fwd: boolean, large: boolean) => {
    console.log('doStep', fwd, large)
  }

  const largeIcon = { fontSize: '1.5em', enabled: !time.filterApplied ? 'disabled' : 'enabled' }

  return (
    <>  <Row>
          <Col span={4}>
            <Button icon={time.filterApplied ? <FilterFilled/> : <FilterOutlined/>} onClick={() => setFilterApplied(!time.filterApplied)}></Button>
          </Col>
          <Col span={16}>
          </Col>
          <Col span={4}>
            <Button onClick={copyMapToClipboard} icon={<CopyOutlined/>} />
          </Col>
         </Row>
         <Form disabled={!time.filterApplied}>
         <table style={{width: '100%'}}>
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
