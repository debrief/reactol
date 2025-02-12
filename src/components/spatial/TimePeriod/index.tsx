import React, { useMemo } from 'react'
import './index.css'
import { useDocContext } from '../../../state/DocContext'
import toDTG from '../../../helpers/toDTG'

const TimePeriod: React.FC = () => {
  const { time } = useDocContext()

  const timePeriod = useMemo(() => {
    if (time.start && time.end) {
      const formattedTimePeriod = `${toDTG(new Date(time.start))} - ${toDTG(new Date(time.end))}`
      return formattedTimePeriod  
    } else {
      return 'Pending'
    }
  }, [time])

  if (!time.start && !time.end) return null

  return <div className="time-period-panel">
    <p>{timePeriod}</p>
  </div>
}

export default TimePeriod
