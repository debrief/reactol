import { Feature, GeoJsonProperties, Geometry, MultiPoint, Point, Polygon, Position } from 'geojson'
import { Checkbox, ColorPicker, DatePicker, Form, Input, Button } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { ZoneProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import { ZoneSpecificsModal } from './ZoneSpecificsModal'
import { CoreCircularProps, ZoneRectangleProps, ZoneShapeProps } from '../../zoneShapeTypes'
import { generateShapeCoordinates } from '../../helpers/shapeGeneration'
import { ZoneShapes } from '../Layers/zoneShapeConstants'
import { EditOnMapButton } from '../CoreForm/EditOnMapButton'
import { CIRCLE_SHAPE, CIRCULAR_RING_SHAPE, CIRCULAR_SECTOR_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'

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

const featureForShape = (feature: Feature<Geometry, ZoneProps>): Feature<Geometry, GeoJsonProperties> => {
  const shapeType = feature.properties?.specifics?.shapeType
  switch(shapeType) {
  case CIRCLE_SHAPE:
  case CIRCULAR_RING_SHAPE:
  case CIRCULAR_SECTOR_SHAPE:
  case SECTION_CIRCULAR_RING_SHAPE:  
  {
    const origin = (feature.properties.specifics as CoreCircularProps).origin
    const res: Feature<Point, GeoJsonProperties> = {
      type: 'Feature',
      id: 'temp',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: origin
      }
    }  
    return res
  }
  case POLYGON_SHAPE:
  {
    const poly = feature.geometry as Polygon
    const res: Feature<Polygon, GeoJsonProperties> = {
      type: 'Feature',
      id: 'temp',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: poly.coordinates
      }
    }  
    return res 
  }
  case RECTANGLE_SHAPE:
  {
    const specifics = feature.properties.specifics as ZoneRectangleProps
    const tl = specifics.topLeft
    const br = specifics.bottomRight
    const res: Feature<MultiPoint, GeoJsonProperties> = {
      type: 'Feature',
      id: 'temp',
      properties: {},
      geometry: {
        type: 'MultiPoint',
        coordinates: [tl, br]
      }
    }
    return res 
  }
  default:
    return feature
  }
}

export interface ZoneFormProps {
  shape: Feature<Geometry, ZoneProps>
  onChange: (shape: Feature<Geometry, ZoneProps>) => void
}

export const ZoneForm: React.FC<ZoneFormProps> = ({shape, onChange}) => {
  const [state, setState] = useState<FormTypeProps | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formProps, setFormProps] = useState<ZoneProps | null>(shape.properties)
  const { setEditableMapFeature } = useDocContext()

  useEffect(() => {
    if (shape) {
      setState(convert(shape.properties))
    }
  }, [shape, setState])

  const shapeName = useMemo(() => {
    return ZoneShapes.find((s) => s.key === state?.specifics?.shapeType)?.label
  }, [state?.specifics?.shapeType])

  const mapEdit = () => {
    // console.clear()
    // create a feature for this shape type
    const mapFeature = featureForShape(shape)
    setEditableMapFeature({feature: mapFeature, onChange: (value: Feature<Geometry, GeoJsonProperties>) => {
      const shapeType = shape.properties.specifics?.shapeType
      switch(shapeType) {
      case CIRCLE_SHAPE:
      case CIRCULAR_RING_SHAPE:
      case CIRCULAR_SECTOR_SHAPE:
      case SECTION_CIRCULAR_RING_SHAPE:  
      {
        const point = value.geometry as Point
        const newCoords = point.coordinates as [number, number] 
        const updatedSpecifics = { ...shape.properties.specifics, origin: newCoords } 
        const zoneProps = { ...shape.properties, specifics: updatedSpecifics }
        setFormProps(zoneProps)
        handleModalOk(updatedSpecifics, [])
        return     
      }
      case POLYGON_SHAPE:
      {
        const poly = value.geometry as Polygon
        handleModalOk(shape.properties.specifics, poly.coordinates)
        return
      }
      case RECTANGLE_SHAPE:
      {
        const multiPoint = value.geometry as MultiPoint
        const newCoords = multiPoint.coordinates as [[number, number], [number, number]]
        const updatedSpecifics: ZoneRectangleProps = { ...shape.properties.specifics, topLeft: newCoords[0], bottomRight: newCoords[1] }
        const zoneProps = { ...shape.properties, specifics: updatedSpecifics }
        setFormProps(zoneProps)
        handleModalOk(updatedSpecifics, [])
        return
      }
      default:
        return value
      }
    }})
  }

  const localChange = (values: Partial<FormTypeProps>) => {
    if (values.stroke) {
      values.stroke = (values.stroke as unknown as Color).toHexString()
    }
    if (values.fill) {
      values.fill = (values.fill as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as FormTypeProps
    const convertedProps = convertBack(updatedProps)
    const combinedProps = ({...formProps, ...convertedProps})
    // store the updated form props, so when the modal form closes,
    // the handler can collate all data.
    setFormProps(combinedProps)
    const res = {...shape, properties: convertedProps}
    onChange(res)
  }

  const handleSpecificsEdit = () => {
    setIsModalOpen(true)
  }

  const handleModalOk = (updatedSpecifics: ZoneShapeProps, coordinates: Position[][]) => {
    // Use provided coordinates for polygon, generate for other shapes
    const shapeCoordinates = generateShapeCoordinates(updatedSpecifics, coordinates)
    const updatedGeometry: Polygon = { type: 'Polygon', coordinates: shapeCoordinates }
    const updatedProps = {...formProps, specifics: updatedSpecifics} as ZoneProps
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
        name='stroke'
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' presets={presetColors} />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label="Fill"
        name='fill'
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' presets={presetColors} />
      </Form.Item>
      <Form.Item
        label="Shape"
        style={itemStyle}>
        <Button onClick={handleSpecificsEdit}>Edit {shapeName}</Button>
        <EditOnMapButton onEdit={mapEdit} />
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
