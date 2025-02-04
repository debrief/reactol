import { ChangeEventHandler, useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import ReactInputMask from 'react-input-mask'

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

interface MaskProps {
  mask: string,
  placeholder?: string,
  maskChar?: string,
  alwaysShowMask?: boolean,
  value?: string
  defaultValue?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
};

export const InputMask: React.FC<MaskProps> = ({ mask, maskChar, alwaysShowMask, value, defaultValue, onChange }) => {
  return (
    <ReactInputMask
      mask={mask}
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
const parseDMSString = (dmsString: string, isLatitude: boolean): number | null => {
  const expression = isLatitude ? /^(\d{2})°(\d{2})'(\d{2}\.\d{2})"([NS])$/ : 
    /^(\d{3})°(\d{2})'(\d{2}\.\d{2})"([EW])$/
  const match = dmsString.match(expression)
  console.log('parse', dmsString, match)
  if (!match) return null

  const [, degreesStr, minutesStr, secondsStr, hemisphere] = match
  const degrees = parseInt(degreesStr, 10)
  const minutes = parseInt(minutesStr, 10)
  const seconds = parseFloat(secondsStr)

  // check for valid hemisphere value
  if (hemisphere !== 'N' && hemisphere !== 'S' && hemisphere !== 'E' && hemisphere !== 'W') return null

  if (minutes >= 60 || seconds >= 60) return null
  if ((hemisphere === 'N' || hemisphere === 'S') && degrees > 90) return null
  if ((hemisphere === 'E' || hemisphere === 'W') && degrees > 180) return null

  const decimal = degrees + minutes / 60 + seconds / 3600
  const multiplier = (hemisphere === 'S' || hemisphere === 'W') ? -1 : 1
  console.log('res', degrees, minutes, seconds, decimal * multiplier) 
  return decimal * multiplier
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [latString, setLatString] = useState<string>(decimalToDMSString(value?.[0] || 0, true))
  const [lngString, setLngString] = useState<string>(decimalToDMSString(value?.[1] || 0, false))
  const [latError, setLatError] = useState<boolean>(false)
  const [lngError, setLngError] = useState<boolean>(false)

  useEffect(() => {
    if (value) {
      setLatString(decimalToDMSString(value[0], true))
      setLngString(decimalToDMSString(value[1], false))
      setLatError(false)
      setLngError(false)
    }
  }, [value])

  const handleLatChange = (newLatString: string) => {
    const decimal = parseDMSString(newLatString, true)
    console.log('lat', newLatString, decimal)
    setLatString(newLatString)
    setLatError(decimal === null)
    if (decimal !== null) {
      onChange?.([decimal, value?.[1] || 0])
    }
  }

  const handleLngChange = (newLngString: string) => {
    console.log('lng', newLngString)
    setLngString(newLngString)
    const decimal = parseDMSString(newLngString, false)
    setLngError(decimal === null)
    if (decimal !== null) {
      onChange?.([value?.[0] || 0, decimal])
    }
  }

  const latMask = '99°99\'99.99"a'
  const latPlaceholder = '00°00\'00.00"N'
  const lngMask = '999°99\'99.99"a'
  const lngPlaceholder = '000°00\'00.00"E'

  const errorStyle = {
    color: '#ff4d4f',
    fontSize: '14px',
    lineHeight: '1.5715',
    marginTop: '4px'
  }

  return (
    <>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <div>
            <InputMask mask={latMask} defaultValue={latString} placeholder={latPlaceholder} onChange={(e) => handleLatChange(e.target.value)}/>
            {latError && <div style={errorStyle}>Invalid latitude format</div>}
          </div>
        </Col>
        <Col span={12}>
          <div>
            <InputMask mask={lngMask} defaultValue={lngString} placeholder={lngPlaceholder} onChange={(e) => handleLngChange(e.target.value)}/>
            {lngError && <div style={errorStyle}>Invalid longitude format</div>}
          </div>
        </Col>
      </Row>
    </>
  )
}
