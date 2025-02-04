import { Feature, Geometry, Polygon, Position } from 'geojson'
import { Checkbox, ColorPicker, DatePicker, Form, Input, Button } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { ZoneProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import { ZoneSpecificsModal } from './ZoneSpecificsModal'
import { ZoneShapeProps } from '../../zoneShapeTypes'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../../constants'

/** swap the time string a parameter of the expected type */
type FormTypeProps = Omit<ZoneProps, 'time' | 'timeEnd'> & {
  dTime: Dayjs
  dTimeEnd: Dayjs
}

const convert = (shape: Readonly<ZoneProps>): FormTypeProps=> {
  const oldVal = shape
  const newVal = {...shape} as FormTypeProps
  if (oldVal.time) {
    newVal.dTime = dayjs(oldVal.time)
    delete (newVal as Partial<ZoneProps>).time
  }
  if (oldVal.timeEnd) {
    newVal.dTimeEnd = dayjs(oldVal.timeEnd)
    delete (newVal as Partial<ZoneProps>).timeEnd
  }
  return newVal
}

const convertBack = (shape: Readonly<FormTypeProps>): ZoneProps => {
  const oldVal = shape
  const newVal = {...shape} as ZoneProps
  if (shape.dTime) {
    newVal.time = oldVal.dTime.toISOString() 
    delete (newVal as Partial<FormTypeProps>).dTime
  }
  if (shape.dTimeEnd) {
    newVal.timeEnd = oldVal.dTimeEnd.toISOString() 
    delete (newVal as Partial<FormTypeProps>).dTimeEnd
  }
  return newVal
}

// Generate points for a circle or arc
const metersToDegreesAtLatitude = (meters: number, latitude: number): number => {
  // Length of a degree of latitude is roughly constant at 111,319.9 meters
  // Length of a degree of longitude varies with cosine of latitude
  const latitudeDegrees = meters / 111319.9
  const longitudeDegrees = meters / (111319.9 * Math.cos(latitude * Math.PI / 180))
  // Return the larger value to ensure the circle isn't too small
  return Math.max(latitudeDegrees, longitudeDegrees)
}

const generateCirclePoints = (
  origin: [number, number],
  radiusM: number,
  startAngle = 0,
  endAngle = 360,
  numPoints = 12
): Position[] => {
  const points: Position[] = []
  const angleStep = (endAngle - startAngle) / numPoints
  const radiusDegrees = metersToDegreesAtLatitude(radiusM, origin[1])
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (90 - (startAngle + i * angleStep)) * (Math.PI / 180)
    const x = origin[0] + radiusDegrees * Math.cos(angle)
    const y = origin[1] + radiusDegrees * Math.sin(angle)
    points.push([x, y])
  }
  
  // Close the shape by adding the first point again
  if (endAngle - startAngle === 360) {
    points.push([points[0][0], points[0][1]])
  }

  console.log('generated points', points)
  
  return points
}

const generateShapeCoordinates = (specifics: ZoneShapeProps): Position[][] => {
  switch (specifics.shapeType) {
  case RECTANGLE_SHAPE: {
    let { topLeft, bottomRight } = specifics
    // reverse the coords in the corners
    topLeft = [topLeft[1], topLeft[0]]
    bottomRight = [bottomRight[1], bottomRight[0]]
    return [[
      topLeft,
      [bottomRight[0], topLeft[1]],
      bottomRight,
      [topLeft[0], bottomRight[1]],
      topLeft // Close the polygon
    ]]
  }
  
  case CIRCLE_SHAPE: {
    const { origin, radiusM } = specifics
    // swap the origin coords
    const fixedOrigin: [number, number] = [origin[1], origin[0]]
    return [generateCirclePoints(fixedOrigin, radiusM)]
  }
  
  case CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM } = specifics
    // swap the origin coords
    const fixedOrigin: [number, number] = [origin[1], origin[0]]
    // Create two circles - outer and inner (in reverse for proper polygon with hole)
    const outerRing = generateCirclePoints(fixedOrigin, outerRadiusM)
    const innerRing = generateCirclePoints(fixedOrigin, innerRadiusM).reverse()
    return [outerRing, innerRing]
  }
  
  case SECTION_CIRCULAR_RING_SHAPE: {
    const { origin, innerRadiusM, outerRadiusM, startAngle, endAngle } = specifics
    // swap the origin coords
    const fixedOrigin: [number, number] = [origin[1], origin[0]]
    // Create the arc segments and connect them
    const outerArc = generateCirclePoints(fixedOrigin, outerRadiusM, startAngle, endAngle)
    // Create the arc segments and connect them
    const innerArc = generateCirclePoints(fixedOrigin, innerRadiusM, endAngle, startAngle)
    return [[
      ...outerArc,
      ...innerArc,
      outerArc[0] // Close the polygon
    ]]
  }
  
  case CIRCULAR_SECTOR_SHAPE: {
    const { origin, startAngle, endAngle, radiusM } = specifics
    const switchedOrigin: [number, number] = [origin[1], origin[0]]
    const arc = generateCirclePoints(switchedOrigin, radiusM, startAngle, endAngle)
    return [[
      switchedOrigin,
      ...arc,
      switchedOrigin // Close the polygon
    ]]
  }
  
  default:
    return []
  }
}

export interface ZoneFormProps {
  shape: Feature<Geometry, ZoneProps>
  onChange: (shape: Feature<Geometry, ZoneProps>) => void
}

export const ZoneForm: React.FC<ZoneFormProps> = ({shape, onChange}) => {
  const [state, setState] = useState<FormTypeProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (shape) {
      setState(convert(shape.properties))
    }
  }, [shape, setState])

  const localChange = (values: Partial<FormTypeProps>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as FormTypeProps
    const convertedProps = convertBack(updatedProps)
    const res = {...shape, properties: convertedProps}
    onChange(res)
  }

  const handleSpecificsEdit = () => {
    setIsModalOpen(true)
  }

  const handleModalOk = (updatedSpecifics: ZoneShapeProps, coordinates: Position[][]) => {
    // Use provided coordinates for polygon, generate for other shapes
    const shapeCoordinates = updatedSpecifics.shapeType === POLYGON_SHAPE 
      ? coordinates 
      : generateShapeCoordinates(updatedSpecifics)

    console.log('coords', shapeCoordinates)

    const updatedGeometry: Polygon = { type: 'Polygon', coordinates: shapeCoordinates }
    const updatedProps = {...shape.properties, specifics: updatedSpecifics}
    const res: Feature<Geometry, ZoneProps> = {...shape, type: 'Feature', geometry: updatedGeometry, properties: updatedProps }
    onChange(res)
    setIsModalOpen(false)
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <Form
      name={'createShape-' + shape.id}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 400 }}
      initialValues={state}
      autoComplete='off'
      onValuesChange={localChange}
      size='small'>
      <Form.Item<FormTypeProps>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter zone name!' }]}>
        <Input/>
      </Form.Item>
      <Form.Item<FormTypeProps>
        label='Visible'
        name={'visible'}
        style={itemStyle}
        valuePropName="checked" >
        <Checkbox style={{alignItems: 'start'}}  />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label="Color"
        name='color'
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' presets={presetColors} />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label='Shape'
        name={['specifics', 'shapeType']}
        style={itemStyle} >
        <Input disabled />
      </Form.Item>
      <Form.Item
        label="Specifics"
        style={itemStyle}>
        <Button onClick={handleSpecificsEdit}>Edit</Button>
      </Form.Item>
      <Form.Item<FormTypeProps>
        label='Start'
        name='dTime'
        style={itemStyle}>
        <DatePicker showTime />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label='End'
        name='dTimeEnd'
        style={itemStyle}>
        <DatePicker showTime />
      </Form.Item>
      <ZoneSpecificsModal
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        specifics={shape.properties.specifics}
        coordinates={(shape.geometry as Polygon).coordinates}
      />
    </Form>
  )
}
