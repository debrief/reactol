import { Col, Row, Slider } from "antd";
import { ClockCircleOutlined, FilterOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { format } from 'date-fns';
import { useAppContext } from "../context/AppContext";

export interface TimeProps {
  start: number
  end: number
  current?: number
}

const steps = 100

const scaled = (start: number, end: number, value: number): number => {
  const range = end - start
  return (value - start) / (range) * steps
}

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

const TimeControl: React.FC<TimeProps> = ({start, end, current}) => {
  const { time, setTime } = useAppContext();

  const [value, setValue] = useState<[number, number, number]>([0, steps / 2, steps]);
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const tStart = time[0] || start
    const tEnd = time[2] || end 
    const tCurrent = time[1] || current || (tStart + tEnd) / 2
    const val = [0, scaled(tStart, tEnd, tCurrent || (tStart + tEnd) / 2), steps]
    console.log('time state updated', tStart, tEnd, tCurrent, val)
    setValue(val as [number, number, number])
  }, [start, end, current])

  const setNewValue = (newValue: number[]) => {
    const unscaledValues = newValue.map((val) => unscaled(start, end, val))
    setTime(unscaledValues as [number, number, number])
    setValue(newValue as [number, number, number])
  }

  const PlayControl = useMemo(() => {
    if (playing && value[1] < steps) {
      if (!timerRef.current) {
        timerRef.current =  setInterval(() => {
          let curTime = 0
          setValue(prev => {
            const newArr: [number, number, number] = [...prev]
            // the first time around, the current time is empty, so use on from `value`
            const newTime = newArr[1] ? newArr[1] + 20 : value[1]
            newArr[1] = newTime
            curTime = newTime
            return newArr
          })
          // also dispatch the time
          const newTime = unscaled(start, end, curTime)
          const unscaledValues = value.map((val) => unscaled(start, end, val))
          unscaledValues[1] = newTime
          setTime(unscaledValues as [number, number, number])
      
        }, 1000)
      }
      return <PauseCircleOutlined onClick={() => setPlaying(false)}/>
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return <PlayCircleOutlined onClick={() => setPlaying(true)}/>
    }
  }, [playing, value])

  return (
    <>  <Row>
          <Col span={4}>
            {PlayControl}
          </Col>
          <Col span={20}>
            <Slider
              range={{draggableTrack: true}}
              defaultValue={value}
              value={value}
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
            <th><ClockCircleOutlined />Current</th>
            <th><FilterOutlined />End</th>
          </tr>
          </thead>
          <tbody>
            <tr style={{fontFamily: 'monospace'}}>
              <td>{timeStr(time, 0)}</td>
              <td style={{fontWeight: 'bold'}}>{timeStr(time[1])}</td>
              <td>{timeStr(time, 1)}</td>
            </tr>
          </tbody>
      </table>
    </>
  );
};

export default TimeControl
