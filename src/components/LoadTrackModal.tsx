import { Button, ColorPicker, Form, FormProps, Input, InputNumber, Modal, Select, Space, Tabs } from "antd"
import { Color } from "antd/es/color-picker"
import { standardShades } from "../helpers/standardShades"
import { PresetsItem } from "antd/es/color-picker/interface"
import { useAppSelector } from "../app/hooks"

export type NewTrackProps = {
  name: string
  shortName: string
  year: number
  month: number
  symbol: string
  color: string
  trackId?: string
}

export interface LoadTrackModelProps {
  visible: boolean
  newTrack: (value: NewTrackProps) => void
  addToTrack: (trackId: string) => void
  cancel: () => void
}

export const LoadTrackModel: React.FC<LoadTrackModelProps> = ({
  visible,
  cancel,
  newTrack,
  addToTrack
}) => {
  const onFinishAdd: FormProps<{id: string}>["onFinish"] = (id) => {
    addToTrack(id.id)
  }

  const onFinishCreate: FormProps<NewTrackProps>["onFinish"] = (values) => {
    const colorValue = values.color as any as Color
    values.color = colorValue.toRgbString()
    newTrack(values)
  }

  const onCancel = () => {
    console.log('cancel')
    cancel()
  }
  const initialYear = new Date().getFullYear()
  const initialMonth = new Date().getMonth() + 1
  const itemStyle = { marginBottom: 0 }
  const symbolOptions = [
    { value: 'air', label: 'AIR' },
    { value: 'nav', label: 'NAV' },
    { value: 'sub', label: 'SUB' },
    { value: 'lnd', label: 'LND' },
    { value: 'unk', label: 'UNK' }
  ]

  const presetColors: PresetsItem[] = [{
        label: 'Standard Shades',
        colors: standardShades.map((shade) => shade.value),
        defaultOpen: true
  }]

  const features = useAppSelector(state => state.featureCollection.features)
  const trackOptions = features.filter(feature => feature.properties?.dataType === 'track')
    .map(feature => ({ value: feature.id, label: feature.properties?.name || feature.id }))
    
  return (
    <Modal
      title='Complete track data'
      className='load-track-modal'
      open={visible}
      onCancel={onCancel}
      footer={[]}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Add to existing track" key="1">
          <Form
            name='addToTrack'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: 400 }}
            initialValues={{ year: initialYear, month: initialMonth }}
            onFinish={onFinishAdd}
            autoComplete='off'
          >
            <Form.Item<NewTrackProps>
              label='Track'
              name='trackId'
              style={itemStyle}
              rules={[{ required: true, message: "Please select a track!" }]}
            >
              <Select options={trackOptions} />
            </Form.Item>
            <Form.Item label={null}>
              <Button type='text' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='primary' htmlType='submit'>
                Add
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Create new track" key="2">
          <Form
            name='createTrack'
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            style={{ maxWidth: 400 }}
            initialValues={{ year: initialYear, month: initialMonth }}
            onFinish={onFinishCreate}
            autoComplete='off'
          >
            <Form.Item<NewTrackProps>
              label='Name'
              name='name'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter track name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<NewTrackProps>
              label='Short Name'
              name='shortName'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter abbreviated track name!" }]}
            >
              <Space.Compact>
                <Input maxLength={4} />
              </Space.Compact>
            </Form.Item>

            <Form.Item<NewTrackProps>
              label='Year'
              name='year'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter Year for data" }]}
            >
              <InputNumber min={2020} max={2040} changeOnWheel />
            </Form.Item>

            <Form.Item<NewTrackProps>
              label='Month'
              name='month'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter Month for data" }]}
            >
              <InputNumber min={1} max={12} changeOnWheel  />
            </Form.Item>

            <Form.Item<NewTrackProps>
              label='Environment'
              name='symbol'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter track symbol" }]}
            >
              <Select defaultValue={symbolOptions[0].value} options={symbolOptions}  />
            </Form.Item>

            <Form.Item<NewTrackProps>
              label='Colour'
              name='color'
              style={itemStyle}
              rules={[{ required: true, message: "Please enter track color" }]}
            >
              <ColorPicker presets={presetColors} disabledFormat showText={false} disabledAlpha defaultValue={"#f00"} format="hex" trigger="hover"  />
            </Form.Item>

            <Form.Item label={null}>
              <Button type='text' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  )
}
