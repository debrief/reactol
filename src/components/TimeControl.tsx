import { Slider } from "antd";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from "../app/hooks";

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

const TimeControl: React.FC<TimeProps> = ({start, end, current}) => {
  const {limits, current: stateCurrent} = useAppSelector(state => state.time)
  const dispatch = useAppDispatch()


  const [value, setValue] = useState<[number, number, number]>([0, steps/2, steps]);

  useEffect(() => {
    const tStart = limits ? limits[0] : start
    const tEnd = limits ? limits[1] : end 
    const tCurrent = stateCurrent || current || (tStart + tEnd) / 2
    const val = [0, steps, scaled(tStart, tEnd, tCurrent || (tStart + tEnd) / 2)]
    setValue(val as [number, number, number])
  }, [start, end, current])

  const setNewValue = (newValue: number[]) => {
    const unscaledValues = newValue.map((val) => unscaled(start, end, val))

    dispatch({type: 'time/limitsChanged', payload: [unscaledValues[0], unscaledValues[2]]})
    dispatch({type: 'time/timeChanged', payload: unscaledValues[1]})

    setValue(newValue as [number, number, number])
  }

  const pf = (val: number) => format(new Date(val), 'HH:mm:ss')

  return (
    <>
      <Slider
        range={{draggableTrack: true}}
        tooltip={{open: true, placement: 'top', formatter: (val) => pf(unscaled(start, end, val || 1))}}
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
    </>
  );
};

export default TimeControl
