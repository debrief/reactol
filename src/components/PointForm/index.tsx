import { Feature, Point, Position } from "geojson";
import { PointProps } from "../../types";
import { Checkbox, ColorPicker, DatePicker, Form, Input } from "antd";
import { Color } from "antd/es/color-picker";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useEffect, useState } from "react";

export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

type PointsWithCoords = PointProps & {
  coords: Position
  dTime: Dayjs
}

const convert = (point: Feature<Point, PointProps>): PointsWithCoords => {
  return {...point.properties, coords: point.geometry.coordinates, dTime: dayjs(point.properties.time)} as PointsWithCoords
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {
  const [values, setValues] = useState<PointsWithCoords | null>(null)

  useEffect(() => {
    setValues(convert(point))
  }, [point, setValues])

  const localChange = (values: Partial<PointsWithCoords>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    if (values.dTime) {
      values.time = (values.dTime as Dayjs).toISOString()
      delete values.dTime
    }
    const updatedProps = {...point.properties, ...values}
    const newVal = {...point, properties: updatedProps} as Feature<Point, PointProps>
    onChange(newVal)
  }

  if (!values) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      style={{ maxWidth: 400 }}
      initialValues={values}
      autoComplete='off'
      onValuesChange={localChange}
      variant='filled'
      size='middle'
    >
      <Form.Item<PointsWithCoords>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter track name!' }]}
      >
        <Input/>
      </Form.Item>
      <Form.Item<PointsWithCoords>
        label='Visible'
        name='visible'
        style={itemStyle}
        valuePropName="checked" 
      >
        <Checkbox style={{alignItems: 'start'}}  />
      </Form.Item>
      <Form.Item<PointsWithCoords>
        label="Color"
        name="color"
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' />
      </Form.Item>
      <Form.Item<PointsWithCoords>
        label="Time"
        style={itemStyle}
        name="dTime">
        <DatePicker showTime format={'MMM DDHHmm'} />
      </Form.Item>

    </Form>
  )
}

