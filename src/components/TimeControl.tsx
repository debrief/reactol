import { AutoComplete, Col, Row, Slider } from "antd";
import { ClockCircleOutlined, FilterOutlined } from '@ant-design/icons';
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
      end: unscaled(start, end, newValue.end)
    }
    setTime(unscaledValues)
    setValue(newValue)
    if (onTimeFilterChange) {
      const formattedTimePeriod = `${pf(unscaledValues.start)} - ${pf(unscaledValues.end)}`;
      onTimeFilterChange(formattedTimePeriod);
    }
  }

  return (
    <>  <Row>
          <Col span={20}>
            <Slider
              range={{draggableTrack: true}}
              defaultValue={[value.start, value.end]}
              value={[value.start, value.end]}
              tooltip={{open: false}}
              max={steps}
              min={0}
              onChange={setNewValue}
              styles={{
                track: {
                  background: 'transparent',
                },
                tracks: {
                  background: '#666',
                },
              }}/>
          </Col>
         </Row>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <th><FilterOutlined />Start</th>
            <th><ClockCircleOutlined />Step</th>
            <th><FilterOutlined />End</th>
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
          </tbody>
      </table>
    </>
  );
};

export default TimeControl
