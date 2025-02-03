import { useEffect, useState, ChangeEvent } from 'react'
import { MaskedInput } from 'antd-mask-input'
import { Col, Row } from 'antd'

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

// Convert decimal degrees to DMS string
const decimalToDMSString = (decimal: number, isLatitude: boolean): string => {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100

  const hemisphere = isLatitude
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W'

  return `${degrees.toString().padStart(2, '0')}°${minutes.toString().padStart(2, '0')}'${seconds.toFixed(2).padStart(5, '0')}"${hemisphere}`
}

// Parse DMS string to decimal degrees
const parseDMSString = (dmsString: string, isLatitude: boolean): number | null => {
  const expression = isLatitude ? /^\d{2}°\d{2}'\d{2}\.\d{2}"[NSEW]$/ : 
    /^\d{3}°\d{2}'\d{2}\.\d{2}"[EW]$/
  const match = dmsString.match(expression)
  if (!match) return null

  const [, degreesStr, minutesStr, secondsStr, hemisphere] = match
  const degrees = parseInt(degreesStr, 10)
  const minutes = parseInt(minutesStr, 10)
  const seconds = parseFloat(secondsStr)

  if (minutes >= 60 || seconds >= 60) return null
  if ((hemisphere === 'N' || hemisphere === 'S') && degrees > 90) return null
  if ((hemisphere === 'E' || hemisphere === 'W') && degrees > 180) return null

  const decimal = degrees + minutes / 60 + seconds / 3600
  const multiplier = (hemisphere === 'S' || hemisphere === 'W') ? -1 : 1
  return decimal * multiplier
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [latString, setLatString] = useState<string>(decimalToDMSString(value?.[0] || 0, true))
  const [lngString, setLngString] = useState<string>(decimalToDMSString(value?.[1] || 0, false))

  useEffect(() => {
    if (value) {
      setLatString(decimalToDMSString(value[0], true))
      setLngString(decimalToDMSString(value[1], false))
    }
  }, [value])

  const handleLatChange = (newLatString: string) => {
    console.log('lat', newLatString)
    setLatString(newLatString)
    const decimal = parseDMSString(newLatString, true)
    if (decimal !== null) {
      onChange?.([decimal, value?.[1] || 0])
    }
  }

  const handleLngChange = (newLngString: string) => {
    console.log('lng', newLngString)
    setLngString(newLngString)
    const decimal = parseDMSString(newLngString, false)
    if (decimal !== null) {
      onChange?.([value?.[0] || 0, decimal])
    }
  }

  const latMask = '00°00\'00.00"N'
  const lngMask = '000°00\'00.00"E'  

  return (
    <>
      <Row>
        <Col span={12}>
          <MaskedInput
            mask={latMask}
            value={latString}
            placeholder={latMask}
            maskOptions={{ lazy: true, placeholderChar:'0' }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleLatChange(e.target.value)}
            definitions={{
              'N': /[NS]/
            }}/>
        </Col>
        <Col span={12}>
          <MaskedInput  
            mask={lngMask}
            value={lngString}
            placeholder={latMask}
            
            maskOptions={{ lazy: true, placeholderChar:'0' }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleLngChange(e.target.value)}
            definitions={{
              'E': /[EW]/
            }} />    
        </Col>
      </Row>
    </>

  )
}
