import { Col, Row, Switch } from 'antd'
import { CoordinateElementInput } from './CoordinateElement'
import { useState } from 'react'

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [shortFormat, setShortFormat] = useState<boolean>(true)

  const handleChange = (newValue: number, isLatitude: boolean) => {
    const result: [number, number] = isLatitude ? [value?.[0] || 0, newValue] : [newValue, value?.[1] || 0]
    onChange && onChange(result)
  }

  if (!value) {
    return null
  }  
  
  return (
    <>
      <Row gutter={[16, 8]} align="middle">
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={9}>
          <CoordinateElementInput 
            style={{width: '90px'}} 
            value={value?.[1] || 0} 
            onChange={handleChange} 
            isLatitude
            shortFormat={shortFormat}
          />
        </Col>
        <Col span={9}>
          <CoordinateElementInput 
            style={{width: '100px'}} 
            value={value?.[0] || 0} 
            onChange={handleChange} 
            isLatitude={false}
            shortFormat={shortFormat}
          />
        </Col>
        <Col span={6}>
          <Switch
            size="small"
            checked={shortFormat}
            onChange={setShortFormat}
            checkedChildren="DM"
            unCheckedChildren="DMS"
          />
        </Col>
      </Row>
    </>
  )
}
