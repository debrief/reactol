import { Feature, Geometry } from 'geojson'
import { Checkbox, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { BackdropProps } from '../../types'
import './index.css'

export interface BackdropFormProps {
  backdrop: Feature<Geometry, BackdropProps>
  onChange: (backdrop: Feature<Geometry, BackdropProps>) => void
}


export const BackdropForm: React.FC<BackdropFormProps> = ({backdrop, onChange}) => {
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
    <>
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
      </Form>
    </>
  )
}
