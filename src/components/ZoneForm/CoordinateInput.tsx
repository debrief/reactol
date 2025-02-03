import { Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { MaskedInput } from 'antd-mask-input'

const { Option } = Select

interface DMSValue {
  degrees: number
  minutes: number
  seconds: number
  hemisphere: 'N' | 'S' | 'E' | 'W'
}

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

// Convert decimal degrees to DMS
const decimalToDMS = (decimal: number, isLatitude: boolean): DMSValue => {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = Math.round((minutesFloat - minutes) * 60 * 100) / 100

  let hemisphere: 'N' | 'S' | 'E' | 'W'
  if (isLatitude) {
    hemisphere = decimal >= 0 ? 'N' : 'S'
  } else {
    hemisphere = decimal >= 0 ? 'E' : 'W'
  }

  return { degrees, minutes, seconds, hemisphere }
}

// Convert DMS to decimal degrees
const dmsToDecimal = (dms: DMSValue): number => {
  const decimal = dms.degrees + dms.minutes / 60 + dms.seconds / 3600
  const multiplier = (dms.hemisphere === 'S' || dms.hemisphere === 'W') ? -1 : 1
  return decimal * multiplier
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [latDMS, setLatDMS] = useState<DMSValue>(decimalToDMS(value?.[0] || 0, true))
  const [lngDMS, setLngDMS] = useState<DMSValue>(decimalToDMS(value?.[1] || 0, false))

  useEffect(() => {
    if (value) {
      setLatDMS(decimalToDMS(value[0], true))
      setLngDMS(decimalToDMS(value[1], false))
    }
  }, [value])

  const handleLatChange = (newLatDMS: Partial<DMSValue>) => {
    const updatedLatDMS = { ...latDMS, ...newLatDMS }
    setLatDMS(updatedLatDMS)
    const decimal = dmsToDecimal(updatedLatDMS)
    onChange?.([decimal, value?.[1] || 0])
  }

  const handleLngChange = (newLngDMS: Partial<DMSValue>) => {
    const updatedLngDMS = { ...lngDMS, ...newLngDMS }
    setLngDMS(updatedLngDMS)
    const decimal = dmsToDecimal(updatedLngDMS)
    onChange?.([value?.[0] || 0, decimal])
  }

  const DMSInput = ({ 
    value: dmsValue, 
    onChange: handleDMSChange, 
    isLatitude 
  }: { 
    value: DMSValue, 
    onChange: (value: Partial<DMSValue>) => void,
    isLatitude: boolean 
  }) => (
    <Space.Compact>
      <MaskedInput
        mask="00°"
        value={dmsValue.degrees.toString().padStart(2, '0')}
        onChange={(e) => handleDMSChange({ degrees: parseInt(e.target.value) || 0 })}
        style={{ width: '50px' }}
      />
      <MaskedInput
        mask="00'"
        value={dmsValue.minutes.toString().padStart(2, '0')}
        onChange={(e) => handleDMSChange({ minutes: parseInt(e.target.value) || 0 })}
        style={{ width: '45px' }}
      />
      <MaskedInput
        mask='00.00\"'
        value={dmsValue.seconds.toFixed(2).padStart(5, '0')}
        onChange={(e) => handleDMSChange({ seconds: parseFloat(e.target.value) || 0 })}
        style={{ width: '70px' }}
      />
      <Select
        value={dmsValue.hemisphere}
        onChange={(hemisphere) => handleDMSChange({ hemisphere: hemisphere as 'N' | 'S' | 'E' | 'W' })}
        style={{ width: '60px' }}
      >
        {isLatitude ? (
          <>
            <Option value="N">N</Option>
            <Option value="S">S</Option>
          </>
        ) : (
          <>
            <Option value="E">E</Option>
            <Option value="W">W</Option>
          </>
        )}
      </Select>
    </Space.Compact>
  )

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DMSInput value={latDMS} onChange={handleLatChange} isLatitude={true} />
      <DMSInput value={lngDMS} onChange={handleLngChange} isLatitude={false} />
    </Space>
  )
}
