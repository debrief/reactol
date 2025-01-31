import { Feature, MultiPoint } from 'geojson'
import {
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  Select,
} from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import { BuoyFieldProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import './index.css'
import { symbolOptions } from '../../helpers/symbolTypes'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

export interface FieldFormProps {
  field: Feature<MultiPoint, BuoyFieldProps>
  onChange: (point: Feature<MultiPoint, BuoyFieldProps>) => void
}

/** swap the time string a parameter of the expected type */
type FormTypeProps = Omit<BuoyFieldProps, 'time' | 'timeEnd'> & {
  dTime: Dayjs
  dTimeEnd: Dayjs
}

export const BuoyFieldForm: React.FC<FieldFormProps> = ({
  field,
  onChange,
}) => {
  const [state, setState] = useState<BuoyFieldProps | null>(null)

  useEffect(() => {
    if (field) {
      const props = field.properties
      setState(convert(props))
    }
  }, [field, setState])

  const convert = (shape: Readonly<BuoyFieldProps>): FormTypeProps=> {
    const oldVal = shape
    const newVal = {...shape} as FormTypeProps
    if (oldVal.time) {
      newVal.dTime = dayjs(oldVal.time)
      delete (newVal as Partial<BuoyFieldProps>).time
    }
    if (oldVal.timeEnd) {
      newVal.dTimeEnd = dayjs(oldVal.timeEnd)
      delete (newVal as Partial<BuoyFieldProps>).timeEnd
    }
    return newVal
  }

  const convertBack = (shape: Readonly<FormTypeProps>): BuoyFieldProps => {
    const oldVal = shape
    const newVal = {...shape} as BuoyFieldProps
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

  const localChange = (values: Partial<FormTypeProps>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as FormTypeProps
    const convertedProps = convertBack(updatedProps)
    const res = {...field, properties: convertedProps}
    onChange(res)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <>
      <Form
        name='trackPropertiesForm'
        className='propertiesForm'
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        style={{ maxWidth: 400 }}
        initialValues={state}
        autoComplete='off'
        onValuesChange={localChange}
        size='small'
      >
        <Form.Item<FormTypeProps>
          label='Name'
          name='name'
          style={itemStyle}
          rules={[{ required: true, message: 'Please enter track name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label='Short name'
          name='shortName'
          style={itemStyle}
          rules={[{ required: true, message: 'Please enter short name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label='Visible'
          name={'visible'}
          style={itemStyle}
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label='Symbol'
          name='symbol'
          style={itemStyle}
          rules={[
            {
              required: true,
              message: 'Please specify the environment/symbol for the track',
            },
          ]}
        >
          <Select options={symbolOptions} />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label='Color'
          name='color'
          style={itemStyle}
          rules={[{ required: true, message: 'color is required!' }]}
        >
          <ColorPicker
            style={{ marginLeft: 0 }}
            format='hex'
            trigger='click'
            presets={presetColors}
          />
        </Form.Item>
        <Form.Item<FormTypeProps> label='Time' style={itemStyle} name='dTime'>
          <DatePicker showTime format={'MMM DDHHmm'} />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label='Time end'
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
          name='dTimeEnd'
        >
          <DatePicker showTime format={'MMM DDHHmm'} />
        </Form.Item>
      </Form>
    </>
  )
}
