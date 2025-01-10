import { Button, Form, FormProps, Input, InputNumber, Modal } from "antd"

export interface LoadTrackModelProps {
  visible: boolean
  setResults: (year: number, month: number, name: string, shortName: string) => void
  cancel: () => void
  year?: number
  month?: number
  name?: string
}

type FieldType = {
  year: number
  month: number
  name: string
  shortName: string
}

export const LoadTrackModel: React.FC<LoadTrackModelProps> = ({
  visible,
  cancel,
  setResults,
  year,
  month,
  name,
}) => {
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    setResults(values.year, values.month, values.name, values.shortName)
  }

  const onCancel = () => {
    cancel()
  }
  const initialYear = year || new Date().getFullYear()
  const initialMonth = month || new Date().getMonth() + 1
  const itemStyle = { marginBottom: 0 }
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
        <Form.Item<FieldType>
          label='Name'
          name='name'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter track name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FieldType>
          label='Short Name'
          name='shortName'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter abbrevieated track name!" }]}
        >
          <Input maxLength={4} />
        </Form.Item>

        <Form.Item<FieldType>
          label='Year'
          name='year'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter Year for data" }]}
        >
          <InputNumber min={2020} max={2040} changeOnWheel />
        </Form.Item>

        <Form.Item<FieldType>
          label='Month'
          name='month'
          style={itemStyle}
          rules={[{ required: true, message: "Please enter Month for data" }]}
        >
          <InputNumber min={1} max={12} changeOnWheel  />
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
