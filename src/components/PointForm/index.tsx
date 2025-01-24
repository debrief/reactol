import { Feature, Geometry } from 'geojson'
import { Checkbox, ColorPicker, DatePicker, Form, Input } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { CoreShapeProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'

export interface PointFormProps {
  shape: Feature<Geometry, CoreShapeProps>
  onChange: (shape: Feature<Geometry, CoreShapeProps>) => void
}

/** swap the time string a parameter of the expected type */
type FormTypeProps = Omit<CoreShapeProps, 'time' | 'timeEnd'> & {
  dTime: Dayjs
  dTimeEnd: Dayjs
}

const convert = (shape: Readonly<CoreShapeProps>): FormTypeProps=> {
  const oldVal = shape
  const newVal = {...shape} as FormTypeProps
  if (oldVal.time) {
    newVal.dTime = dayjs(oldVal.time)
    delete (newVal as Partial<CoreShapeProps>).time
  }
  if (oldVal.timeEnd) {
    newVal.dTimeEnd = dayjs(oldVal.timeEnd)
    delete (newVal as Partial<CoreShapeProps>).timeEnd
  }
  return newVal
}

const convertBack = (shape: Readonly<FormTypeProps>): CoreShapeProps => {
  const oldVal = shape
  const newVal = {...shape} as CoreShapeProps
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

export const PointForm: React.FC<PointFormProps> = ({shape, onChange}) => {
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
      name='createShape'
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

