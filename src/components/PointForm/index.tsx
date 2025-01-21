import { Feature, Point } from "geojson";
import { Checkbox, ColorPicker, DatePicker, Form, Input } from "antd";
import { Color } from "antd/es/color-picker";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { PointProps } from "../../types";
import _ from 'lodash';
import { presetColors } from "../../helpers/standardShades";

export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

/** swap the time string a parameter of the expected type */
type FormTypeProps = Omit<PointProps, 'time'> & {
  dTime: Dayjs
}

const convert = (point: Readonly<PointProps>): FormTypeProps=> {
  const oldVal = point
  const newVal = _.cloneDeep(point) as FormTypeProps
  if (oldVal.time) {
    newVal.dTime = dayjs(oldVal.time)
    delete (newVal as Partial<PointProps>).time
  }
  return newVal
}

const convertBack = (point: Readonly<FormTypeProps>): PointProps => {
  const oldVal = point 
  const newVal = _.cloneDeep(point) as PointProps
  if (point.dTime) {
    newVal.time = oldVal.dTime.toISOString() 
    delete (newVal as Partial<FormTypeProps>).dTime
  }
  return newVal
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {
  const [state, setState] = useState<FormTypeProps | null>(null)

  useEffect(() => {
    if (point) {
      setState(convert(point.properties))
    }
  }, [point, setState])

  const localChange = (values: Partial<FormTypeProps>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as FormTypeProps
    const convertedProps = convertBack(updatedProps)
    const res = {...point, properties: convertedProps}
    onChange(res)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      style={{ maxWidth: 400 }}
      initialValues={state}
      autoComplete='off'
      onValuesChange={localChange}
      size='middle'>
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
    </Form>
  )
}

