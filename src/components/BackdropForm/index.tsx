import { Feature, Geometry } from 'geojson'
import { Checkbox, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { BackdropProps } from '../../types'
import './index.css'

export interface BackdropFormProps {
  backdrop: Feature<Geometry, BackdropProps>
  onChange: (backdrop: Feature<Geometry, BackdropProps>) => void
  create?: boolean
}


export const BackdropForm: React.FC<BackdropFormProps> = ({backdrop, onChange, create = false}) => {
  const [state, setState] = useState<BackdropProps | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (backdrop && form) {
      const dupe = {...backdrop.properties}
      setState(dupe)
      form.setFieldsValue(dupe)
    }
  }, [backdrop, setState, form])

  const localChange = (values: Partial<BackdropProps>) => {
    const dupe = {...values} as unknown as BackdropProps
    const updatedProps= {...state, ...dupe} as BackdropProps
    const res = {...backdrop, properties: updatedProps}
    onChange(res)
  }

  if (!state) {
    return null
  }

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <Form
      form={form}
      name='backdropForm'
      className="propertiesForm"
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 17 }}
      style={{ maxWidth: 400 }}
      initialValues={state}
      autoComplete='off'
      onValuesChange={localChange}
      size='small'>
      <Form.Item<BackdropProps>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter backdrop name!' }]}>
        <Input/>
      </Form.Item>
      <Form.Item<BackdropProps>
        label='Visible'
        name={'visible'}
        style={itemStyle}
        valuePropName="checked" >
        <Checkbox />
      </Form.Item>

      { create && <><Form.Item<BackdropProps>
        label='URL'
        name='url'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter backdrop URL!' }]}>
        <Input.TextArea rows={3}/>
      </Form.Item>
      <Form.Item<BackdropProps>
        label='Max Native Zoom'
        name= 'maxNativeZoom'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter backdrop max native zoom!' }]}>
        <Input/>
      </Form.Item>
      <Form.Item<BackdropProps>
        label='Max Zoom'
        name='maxZoom'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter backdrop max zoom!' }]}>
        <Input/>
      </Form.Item>
      </>}
    </Form>
  )
}
