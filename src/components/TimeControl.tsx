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

  const [value, setValue] = useState<{ start: number, current: number, end: number }>({ start: 0, current: steps / 2, end: steps });
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const tStart = time.start || start
    const tEnd = time.end || end 
    const tCurrent = time.current || current || (tStart + tEnd) / 2
    const val = { start: 0, current: scaled(tStart, tEnd, tCurrent || (tStart + tEnd) / 2), end: steps }
    console.log('time state updated', tStart, tEnd, tCurrent, val)
    setValue(val)
  }, [start, end, current])

  const setNewValue = (newValue: { start: number, current: number, end: number }) => {
    const unscaledValues = {
      start: unscaled(start, end, newValue.start),
      current: unscaled(start, end, newValue.current),
      end: unscaled(start, end, newValue.end)
    }
    setTime(unscaledValues)
    setValue(newValue)
  }

  const PlayControl = useMemo(() => {
    if (playing && value.current < steps) {
      if (!timerRef.current) {
        timerRef.current =  setInterval(() => {
          let curTime = 0
          setValue(prev => {
            const newVal = { ...prev }
            const newTime = newVal.current ? newVal.current + 20 : value.current
            newVal.current = newTime
            curTime = newTime
            return newVal
          })
          const newTime = unscaled(start, end, curTime)
          const unscaledValues = {
            start: unscaled(start, end, value.start),
            current: newTime,
            end: unscaled(start, end, value.end)
          }
          setTime(unscaledValues)
      
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
              defaultValue={[value.start, value.current, value.end]}
              value={[value.start, value.current, value.end]}
              tooltip={{open: false}}
              max={steps}
              min={0}
              onChange={(newValue: [number, number, number]) => setNewValue({ start: newValue[0], current: newValue[1], end: newValue[2] })}
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
              <td>{timeStr(time.start)}</td>
              <td style={{fontWeight: 'bold'}}>{timeStr(time.current)}</td>
              <td>{timeStr(time.end)}</td>
            </tr>
          </tbody>
      </table>
    </>
  );
};

export default TimeControl
