// eslint-disable-next-line quotes
import { ChangeEventHandler, useState } from "react"
import ReactInputMask from 'react-input-mask'

interface MaskProps {
  mask: string,
  placeholder?: string,
  maskChar?: string,
  alwaysShowMask?: boolean,
  value?: string
  defaultValue?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  style?: React.CSSProperties
};

const InputMask: React.FC<MaskProps> = ({ mask, maskChar, alwaysShowMask, value, defaultValue, onChange, style }) => {
  return (
    <ReactInputMask
      mask={mask}
      style={style}
      value={value}
      defaultValue={defaultValue}
      maskChar={maskChar}
      alwaysShowMask={alwaysShowMask}
      onChange={onChange}
    />
  )
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

  const paddingLength = isLatitude ? 2 : 3

  return `${degrees.toString().padStart(paddingLength, '0')}°${minutes.toString().padStart(2, '0')}'${seconds.toFixed(2).padStart(5, '0')}"${hemisphere}`
}

// Parse DMS string to decimal degrees
const parseDMSString = (dmsString: string, isLatitude: boolean): number | string => {
  const expression = isLatitude ? /^(\d{2})°(\d{2})'(\d{2}\.\d{2})"([NS])$/ : 
    /^(\d{3})°(\d{2})'(\d{2}\.\d{2})"([EW])$/
  const match = dmsString.match(expression)
  if (!match) {
    return `Invalid format. Expected format: ${isLatitude ? 'DD°MM\'SS.SS"N/S' : 'DDD°MM\'SS.SS"E/W'}`
  }

  const [, degreesStr, minutesStr, secondsStr, hemisphere] = match
  const degrees = parseInt(degreesStr, 10)
  const minutes = parseInt(minutesStr, 10)
  const seconds = parseFloat(secondsStr)

  // check for valid hemisphere value
  if (hemisphere !== 'N' && hemisphere !== 'S' && hemisphere !== 'E' && hemisphere !== 'W') {
    return `Invalid hemisphere value: ${hemisphere}. Must be ${isLatitude ? 'N or S' : 'E or W'}`
  }

  if (minutes >= 60) {
    return `Invalid minutes value: ${minutes}. Must be less than 60`
  }
  
  if (seconds >= 60) {
    return `Invalid seconds value: ${seconds}. Must be less than 60`
  }

  if (isLatitude && degrees > 90) {
    return `Invalid degrees value: ${degrees}. Latitude must be between 0 and 90 degrees`
  }

  if (!isLatitude && degrees > 180) {
    return `Invalid degrees value: ${degrees}. Longitude must be between 0 and 180 degrees`
  }

  const decimal = degrees + minutes / 60 + seconds / 3600
  const multiplier = (hemisphere === 'S' || hemisphere === 'W') ? -1 : 1
  return decimal * multiplier
}

interface CoordinateElementProps {
  value: number
  onChange: (value: number, isLatitude: boolean) => void
  isLatitude: boolean
  style?: React.CSSProperties
}

export const CoordinateElementInput: React.FC<CoordinateElementProps> = ({ value, onChange , isLatitude, style}) => {
  const [valueString, setValueString] = useState<string>(decimalToDMSString(value || 0, isLatitude))
  const [error, setError] = useState<string | null>(null)

  const handleChange = (newValue: string) => {
    const result = parseDMSString(newValue, isLatitude)
    setValueString(newValue)
    if (typeof result === 'string') {
      setError(result)
    } else {
      setError(null)
      onChange(result, isLatitude)
    }
  }

  const latMask = '99°99\'99.99"a'
  const latPlaceholder = '00°00\'00.00"N'
  const lngMask = '999°99\'99.99"a'
  const lngPlaceholder = '000°00\'00.00"E'

  const mask = isLatitude ? latMask : lngMask
  const placeholder = isLatitude ? latPlaceholder : lngPlaceholder  

  const errorStyle = {
    color: '#ff4d4f',
    fontSize: '14px',
    lineHeight: '1.0715',
    marginTop: '4px'
  }

  return <div>
    <InputMask style={style} mask={mask} defaultValue={valueString} placeholder={placeholder} onChange={(e) => handleChange(e.target.value)}/>
    {error && <div style={errorStyle}>{error}</div>}
  </div>

}