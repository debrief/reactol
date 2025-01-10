import { Button, ColorPicker, Form, FormProps, Input, InputNumber, Modal, Select } from "antd"
import { Color } from "antd/es/color-picker"

export type TrackProps = {
  name: string
  shortName: string
  year: number
  month: number
  symbol: string
  color: string
}

export interface LoadTrackModelProps {
  visible: boolean
  setResults: (value: TrackProps) => void
  cancel: () => void
  year?: number
  month?: number
  name?: string
}

export const LoadTrackModel: React.FC<LoadTrackModelProps> = ({
  visible,
  cancel,
  setResults,
  year,
  month,
  name,
}) => {
  const onFinish: FormProps<TrackProps>["onFinish"] = (values) => {
    const colorValue = values.color as any as Color
    console.log('color', colorValue.toRgbString())
    values.color = colorValue.toRgbString()
    setResults(values)
  }

  const onCancel = () => {
    cancel()
  }
  const initialYear = year || new Date().getFullYear()
  const initialMonth = month || new Date().getMonth() + 1
  const itemStyle = { marginBottom: 0 }
  const symbolOptions = [
    { value: 'air', label: 'AIR' },
    { value: 'nav', label: 'NAV' },
    { value: 'sub', label: 'SUB' },
    { value: 'lnd', label: 'LND' },
    { value: 'unk', label: 'UNK' }
  ]
    
  return (
    <Modal
      title='Complete track data'
      className='load-track-modal'
      open={visible}
      onCancel={onCancel}
      footer={[]}
    >
      <Form
        name='basic'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 400 }}
        initialValues={{ name: name, year: initialYear, month: initialMonth }}
        onFinish={onFinish}
        onFinishFailed={onCancel}
        autoComplete='off'
      >
        <Form.Item<TrackProps>
          label='Name'
          name='name'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter track name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<TrackProps>
          label='Short Name'
          name='shortName'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter abbrevieated track name!" }]}
        >
          <Input maxLength={4} />
        </Form.Item>

        <Form.Item<TrackProps>
          label='Year'
          name='year'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter Year for data" }]}
        >
          <InputNumber min={2020} max={2040} changeOnWheel />
        </Form.Item>

        <Form.Item<TrackProps>
          label='Month'
          name='month'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter Month for data" }]}
        >
          <InputNumber min={1} max={12} changeOnWheel  />
        </Form.Item>

        <Form.Item<TrackProps>
          label='Environment'
          name='symbol'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter track symbol" }]}
        >
          <Select options={symbolOptions}  />
        </Form.Item>

        <Form.Item<TrackProps>
          label='Colour'
          name='color'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter track color" }]}
        >
          <ColorPicker format="hex" trigger="hover"  />
        </Form.Item>

        <Form.Item label={null}>
          <Button type='text' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
