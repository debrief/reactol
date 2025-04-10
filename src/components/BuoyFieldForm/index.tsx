import { Feature, MultiPoint } from 'geojson'
import {
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
} from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BuoyFieldProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import './index.css'
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
  const { t } = useTranslation()
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
    if (values['marker-color']) {
      values['marker-color'] = (values['marker-color'] as unknown as Color).toHexString()
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
          label={t('forms.common.name')}
          name='name'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.nameRequired') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.shortName')}
          name='shortName'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.shortNameRequired') }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.visible')}
          name={'visible'}
          style={itemStyle}
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.color')}
          name='marker-color'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.colorRequired') }]}
        >
          <ColorPicker
            style={{ marginLeft: 0 }}
            format='hex'
            trigger='click'
            presets={presetColors}
          />
        </Form.Item>
        <Form.Item<FormTypeProps> label={t('forms.common.time')} style={itemStyle} name='dTime'>
          <DatePicker showTime format={'MMM DDHHmm'} />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.timeEnd')}
          style={itemStyle}
          // validate that dTimeEnd is after dTime
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                // if there is a value, check if it's after the dTime
                return !value || getFieldValue('dTime') < value
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('forms.common.timeEndAfterTime')))
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
