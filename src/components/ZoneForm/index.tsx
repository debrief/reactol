import { Feature, Geometry } from 'geojson'
import { Checkbox, ColorPicker, DatePicker, Form, Input } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { ZoneProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'

export interface ZoneFormProps {
  shape: Feature<Geometry, ZoneProps>
  onChange: (shape: Feature<Geometry, ZoneProps>) => void
}

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

export const ZoneForm: React.FC<ZoneFormProps> = ({shape, onChange}) => {
  const [state, setState] = useState<FormTypeProps | null>(null)

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
    </Form>
  )
}
