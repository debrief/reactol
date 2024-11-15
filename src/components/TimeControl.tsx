import { Slider } from "antd";
import { useEffect, useState } from "react";

export interface TimeProps {
  start: number
  end: number
  current?: number
  setTime: (value: number) => void
  setLowerLimit: (value: number) => void
  setUpperLimit: (value: number) => void
}

const steps = 500

const scaled = (start: number, end: number, value: number): number => {
  const range = end - start
  return (value - start) / (range) * steps
}

const unscaled = (start: number, end: number, value: number): number => {
  const range = end - start
  return (value / steps) * range + start
}

const TimeControl: React.FC<TimeProps> = ({start, end, current, setTime, setLowerLimit, setUpperLimit}) => {
  const [value, setValue] = useState<[number, number, number]>([0, steps/2, steps]);
  const [timeStrings, setTimeStrings] = useState<string[]>([])

  useEffect(() => {
    
    const val = [0, 50, scaled(start, end, end)]
    console.log('setting value', val)
    setValue(val as [number, number, number])
  }, [start, end, current])

  const setNewValue = (newValue: number[]) => {
    const unscaledValues = newValue.map((val) => unscaled(start, end, val))
    if(newValue[0] !== value[0]) {
      setLowerLimit(unscaledValues[0])
    }
    if(newValue[1] !== value[2]) {
      setUpperLimit(unscaledValues[2])
    }
    if(newValue[2] !== value[1]) {
      setTime(unscaledValues[1])
    }
    setValue(newValue as [number, number, number])
    setTimeStrings(unscaledValues.map((val) => pf(val)))
  }

  const pf = (val: number) => new Date(val).toLocaleTimeString()

  return (
    <>
      <Slider
        range={{draggableTrack: true}}
        tooltip={{visible: true, placement: 'top', formatter: (val) => pf(unscaled(start, end, val || 1))}}
        defaultValue={value}
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
        }}
      />
      <div>{timeStrings.map((item) => ' / ' + item)}</div>
    </>
  );
};

export default TimeControl