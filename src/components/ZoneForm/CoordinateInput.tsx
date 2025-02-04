import { Col, Row } from 'antd'
import { CoordinateElementInput } from './CoordinateElement'


interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}


export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const handleChange = (newValue: number, isLatitude: boolean) => {
    const result: [number, number] = isLatitude ? [value?.[0] || 0, newValue] : [newValue, value?.[1] || 0]
    onChange && onChange(result)
  }

  if (!value) {
    return null
  }  
  
  return (
    <>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <CoordinateElementInput value={value?.[1] || 0} onChange={handleChange} isLatitude/>
        </Col>
        <Col span={12}>
          <CoordinateElementInput value={value?.[0] || 0} onChange={handleChange} isLatitude={false}/>
        </Col>
      </Row>
    </>
  )
}
