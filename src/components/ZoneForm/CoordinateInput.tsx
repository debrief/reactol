import { Col, Row } from 'antd'
import { CoordinateElementInput } from './CoordinateElement'
import { useEffect, useMemo, useState } from 'react'
import { Feature, GeoJsonProperties, Geometry, Point } from 'geojson'
import { useDocContext } from '../../state/DocContext'
import { EditOnMapButton } from '../CoreForm/EditOnMapButton'
import { CoordsSwitch } from '../spatial/MouseCoordinates'

interface CoordinateInputProps {
  value?: [number, number]
  onChange?: (value: [number, number]) => void
}

const shortWidth = 65
const longWidth = 85

export const CoordinateInput: React.FC<CoordinateInputProps> = ({ value, onChange }) => {
  const [shortFormat, setShortFormat] = useState<boolean>(true)
  const { setEditableMapFeature } = useDocContext()

  const fieldWidth = useMemo(() => shortFormat ? shortWidth : longWidth, [shortFormat])
  
  const handleChange = (newValue: number, isLatitude: boolean) => {
    const result: [number, number] = isLatitude ? [value?.[0] || 0, newValue] : [newValue, value?.[1] || 0]
    onChange && onChange(result)
  }

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setEditableMapFeature(null)
    }
  }, [setEditableMapFeature])

  if (!value) {
    return null
  }

  const mapEdit = () => {
    // push coords to map
    const point: Feature<Point> = {
      type: 'Feature',
      id: 'temp',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: value
      }
    }
    setEditableMapFeature({feature: point, onChange: (value: Feature<Geometry, GeoJsonProperties>) => {
      if (value.geometry.type !== 'Point') {
        console.warn('Point form should only receive point updates')
      } else {
        const geom = value.geometry.coordinates as [number, number]
        onChange && onChange(geom)
      }
    }})
  }

  const littlePadding = {
    padding:2
  }

  return (
    <>
      <Row gutter={[16, 8]} align='middle'>
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
          <CoordsSwitch
            checked={shortFormat}
            onChange={setShortFormat}
          />
        </Col>
        <Col span={'30px'}>
          <EditOnMapButton onEdit={mapEdit} />
        </Col>
      </Row>
    </>
  )
}
