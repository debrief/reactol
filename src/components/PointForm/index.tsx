import { Feature, Geometry, Point, Position } from 'geojson'
import { Checkbox, ColorPicker, DatePicker, Form, Input } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { PointProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import { CoordinateInput } from '../ZoneForm/CoordinateInput'

export interface PointFormProps {
  shape: Feature<Geometry, PointProps>
  onChange: (shape: Feature<Geometry, PointProps>) => void
}

/** swap the time string a parameter of the expected type */
type FormTypeProps = Omit<PointProps, 'time' | 'timeEnd'> & {
  dTime: Dayjs
  dTimeEnd: Dayjs
  position: Position
}

type CompositeProps = {
  props: PointProps
  position: Position
}

const convert = (shape: Readonly<CompositeProps>): FormTypeProps=> {
  const oldVal = shape.props
  const newVal = {...shape.props} as FormTypeProps
  if (oldVal.time) {
    newVal.dTime = dayjs(oldVal.time)
    delete (newVal as Partial<PointProps>).time
  }
  if (oldVal.timeEnd) {
    newVal.dTimeEnd = dayjs(oldVal.timeEnd)
    delete (newVal as Partial<PointProps>).timeEnd
  }
  if (shape.position) {
    newVal.position = shape.position
  }
  return newVal
}

const convertBack = (shape: Readonly<FormTypeProps>): CompositeProps => {
  const oldVal = shape
  const newVal = {...shape} as PointProps
  if (shape.dTime) {
    newVal.time = oldVal.dTime.toISOString() 
    delete (newVal as Partial<FormTypeProps>).dTime
  }
  if (shape.dTimeEnd) {
    newVal.timeEnd = oldVal.dTimeEnd.toISOString() 
    delete (newVal as Partial<FormTypeProps>).dTimeEnd
  }
  const position = shape.position
  return {props: newVal, position}
}

export const PointForm: React.FC<PointFormProps> = ({shape, onChange}) => {
  const [state, setState] = useState<FormTypeProps | null>(null)

  useEffect(() => {
    if (shape) {
      setState(convert({props: shape.properties, position: (shape.geometry as Point).coordinates}))
    }
  }, [shape, setState])

  const localChange = (values: Partial<FormTypeProps>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as FormTypeProps
    const converted = convertBack(updatedProps)
    const res: Feature<Geometry, PointProps> = {...shape, properties: converted.props, geometry: {type: 'Point', coordinates: converted.position}}
    onChange(res)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }
  return (
    <Form
      name='createShape'
      labelCol={{ flex: '80px' }}
      wrapperCol={{ flex: 'auto' }}
      style={{ maxWidth: 400 }}
      initialValues={state}
      autoComplete='off'
      onValuesChange={localChange}
      size='small'>
      <Form.Item<FormTypeProps>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter track name!' }]}>
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
        label='Position'
        name='position'
        style={itemStyle}
        rules={[{ required: true }]} >
        <CoordinateInput />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label="Color"
        name='color'
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' presets={presetColors} />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label="Time"
        style={itemStyle}
        name='dTime'>
        <DatePicker showTime format={'MMM DDHHmm'} />
      </Form.Item>
      <Form.Item<FormTypeProps>
        label="Time end"
        style={itemStyle}
        // validate that dTimeEnd is after dTime
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              // if there is a value, check if it's after the dTime
              return !value || getFieldValue('dTime') < value
                ? Promise.resolve()
                : Promise.reject(new Error('Time-end must be after time!'))
            },
          }),
        ]}
        name='dTimeEnd'>
        <DatePicker showTime format={'MMM DDHHmm'} />
      </Form.Item>
    </Form>
  )
}

