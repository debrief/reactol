import { Col, Row, Switch } from 'antd'
import { CoordinateElementInput } from './CoordinateElement'
import { useMemo, useState } from 'react'

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

const shortWidth = 65
const longWidth = 85

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [shortFormat, setShortFormat] = useState<boolean>(true)

  const fieldWidth = useMemo(() => shortFormat ? shortWidth : longWidth, [shortFormat])
  
  const handleChange = (newValue: number, isLatitude: boolean) => {
    const result: [number, number] = isLatitude ? [value?.[0] || 0, newValue] : [newValue, value?.[1] || 0]
    onChange && onChange(result)
  }

  if (!value) {
    return null
  }  

  const littlePadding = {
    padding:2
  }

  return (
    <>
      <Row gutter={[16, 8]} align="middle">
        <Col span={shortWidth} style={littlePadding}>
          <CoordinateElementInput 
            style={{width: `${fieldWidth}px`,padding:2}} 
            value={value?.[1] || 0} 
            onChange={handleChange} 
            isLatitude
            shortFormat={shortFormat}
          />
        </Col>
        <Col span={longWidth} style={littlePadding}>
          <CoordinateElementInput 
            style={{width: `${fieldWidth + 10}px`,padding:2}} 
            value={value?.[0] || 0} 
            onChange={handleChange} 
            isLatitude={false}
            shortFormat={shortFormat}
          />
        </Col>
        <Col span={'30px'}>
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
