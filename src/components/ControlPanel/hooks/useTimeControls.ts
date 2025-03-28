import { useState, useEffect } from 'react'
import { TimeSupport } from '../helpers/time-support'
import { useDocContext } from '../state/DocContext'

interface TimeControlsProps {
  bounds: [number, number] | null
}

export const useTimeControls = ({ bounds }: TimeControlsProps) => {
  const { time, setTime, viewportFrozen, setViewportFrozen, interval, setInterval } = useDocContext()
  const [stepTxt, setStepTxt] = useState<string>('01h00m')
  const [filterApplied, setFilterApplied] = useState(false)
  
  const start = bounds ? bounds[0] : 0
  const end = bounds ? bounds[1] : 0

  // Update interval when step text changes
  useEffect(() => {
    try {
      const period = TimeSupport.parsePeriod(stepTxt)
      setInterval(period)
    } catch (err) {
      console.log('Invalid time format:' + err)
    }
  }, [stepTxt, setInterval])

  // Update time when filter, interval, or bounds change
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

  // Time stepping function
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

  // Toggle viewport freeze
  const toggleFreezeViewport = () => {
    setViewportFrozen(!viewportFrozen)
  }

  return {
    time,
    stepTxt,
    setStepTxt,
    filterApplied,
    setFilterApplied,
    viewportFrozen,
    toggleFreezeViewport,
    doStep
  }
}
