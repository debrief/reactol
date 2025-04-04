import { Feature, LineString } from 'geojson'
import { Checkbox, ColorPicker, Flex, Form, Input, Select } from 'antd'
import { Color } from 'antd/es/color-picker'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrackProps } from '../../types'
import { presetColors } from '../../helpers/standardShades'
import './index.css'
import { defaultIntervals } from '../../helpers/timeIntervals'
import { symbolOptions } from '../../helpers/symbolTypes'

export interface TrackFormProps {
  track: Feature<LineString, TrackProps>
  onChange: (point: Feature<LineString, TrackProps>) => void
}

type FormTypeProps = Omit<TrackProps, 'labelInterval' | 'symbolInterval'> & {
  labelInterval: string
  symbolInterval: string
}


export const TrackForm: React.FC<TrackFormProps> = ({track, onChange}) => {
  const { t } = useTranslation()
  const [state, setState] = useState<FormTypeProps | null>(null)
  const [form] = Form.useForm()
  useEffect(() => {
    if (track && form) {
      const props = track.properties as TrackProps
      const dupe = {...track.properties} as unknown as FormTypeProps
      // convert the intervals to strings
      const dest = dupe as unknown as FormTypeProps
      if (props.labelInterval) {
        dest.labelInterval = props.labelInterval.toString()
      }
      if (props.symbolInterval) {
        dest.symbolInterval = props.symbolInterval.toString()
      }
      setState(dupe)
      form.setFieldsValue(dupe)
    }
  }, [track, setState, form])

  const localChange = (values: Partial<FormTypeProps>) => {
    const dupe = {...values} as unknown as TrackProps
    if (values.stroke) {
      dupe.stroke = (values.stroke as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...dupe} as TrackProps
    if (updatedProps.labelInterval) {
      updatedProps.labelInterval = parseInt(updatedProps.labelInterval as unknown as string)
    }
    if (updatedProps.symbolInterval) {
      updatedProps.symbolInterval = parseInt(updatedProps.symbolInterval as unknown as string)
    }
    const res = {...track, properties: updatedProps}
    onChange(res)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <>
      <Form
        form={form}
        name='trackPropertiesForm'
        className="propertiesForm"
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 17 }}
        style={{ maxWidth: 400 }}
        initialValues={state}
        autoComplete='off'
        onValuesChange={localChange}
        size='small'>
        <Form.Item<FormTypeProps>
          label={t('forms.common.name')}
          name='name'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.nameRequired') }]}>
          <Input/>
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.shortName')}
          name='shortName'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.shortNameRequired') }]}>
          <Input/>
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.visible')}
          name={'visible'}
          style={itemStyle}
          valuePropName="checked" >
          <Checkbox />
        </Form.Item>
        <Form.Item<FormTypeProps>
          label={t('forms.common.environment')}
          name='env'
          style={itemStyle}
          rules={[
            {
              required: true,
              message: t('forms.common.environmentRequired'),
            },
          ]}
        >
          <Select
            options={symbolOptions}
            optionLabelProp="label"
            optionRender={(option) => (
              <Flex align="center" gap={8}>
                {option.data.icon}
                {option.data.label}
              </Flex>
            )}
          />
        </Form.Item>
        <Form.Item<FormTypeProps>
          style={itemStyle}
          label={t('forms.common.markers')}>
          <Flex gap='small'>
            <Form.Item<FormTypeProps>
              label={t('forms.common.labels')}
              className="labelInterval"
              name='labelInterval'
              style={itemStyle}>
              <Select options={defaultIntervals} size='small' style={{width:'55px'}} />
            </Form.Item>
            <Form.Item<FormTypeProps>
              label={t('forms.common.symbols')}
              name='symbolInterval'
              className="labelSymbol"
              style={itemStyle}>
              <Select options={defaultIntervals} size='small' style={{width:'55px'}} />
            </Form.Item>
          </Flex>
        </Form.Item>  
        <Form.Item<FormTypeProps>
          label={t('forms.common.color')}
          name='stroke'
          style={itemStyle}
          rules={[{ required: true, message: t('forms.common.colorRequired') }]}>
          <ColorPicker style={{marginLeft: 0}} format='hex' trigger='click' presets={presetColors} />
        </Form.Item>
      </Form>
    </>
  )
}
