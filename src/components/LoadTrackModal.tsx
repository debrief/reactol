import { Button, ColorPicker, Form, FormProps, Input, InputNumber, Modal, Select, Space, Tabs, TabsProps, Typography } from 'antd'
import { Color } from 'antd/es/color-picker'
import { standardShades } from '../helpers/standardShades'
import { PresetsItem } from 'antd/es/color-picker/interface'
import { useAppSelector } from '../app/hooks'

export type NewTrackProps = {
  name: string
  shortName: string
  year: number
  month: number
  symbol: string
  color: string
  trackId?: string
}

export type AddTrackProps = {
  trackId: string
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
  // collate a list of existing tracks, in case user wants to add data to existing track
  const features = useAppSelector(state => state.featureCollection.features)
  const trackOptions = features.filter(feature => feature.properties?.dataType === 'track')
    .map(feature => ({ value: feature.id, label: feature.properties?.name || feature.id }))

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
  
  const onFinishAdd: FormProps<AddTrackProps>['onFinish'] = (id) => {
    addToTrack(id.trackId)
  }

  const onFinishCreate: FormProps<NewTrackProps>['onFinish'] = (values) => {
    // see if we have to conver the color to rgb string, check if 
    // values.color is an object with a color property
    if (typeof values.color === 'object') {
      const colorValue = values.color as any as Color
      values.color = colorValue.toRgbString()
    }
    newTrack(values)
  }

  const tabs: TabsProps['items'] = [
    {
      key: '1',
      label: 'Add to existing track',
      children: <Form
      name='addToTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 400 }}
      onFinish={onFinishAdd}
      autoComplete='off'
    >
      <Form.Item<AddTrackProps>
        label='Track'
        name='trackId'
        style={itemStyle}
        rules={[{ required: true, message: 'Please indicate which track to add data to' }]}
      >
        <Select options={trackOptions} />
      </Form.Item>
      <Form.Item label={null}>
        <Button type='text' onClick={cancel}>
          Cancel
        </Button>
        <Button type='primary' htmlType='submit'>
          Add
        </Button>
      </Form.Item>
    </Form>,
    },
    {
      key: '2',
      label: 'Create new track',
      children: <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 400 }}
      initialValues={{ year: initialYear, month: initialMonth, 
        symbol: symbolOptions[0].value, color: presetColors[0].colors[0] }}
      onFinish={onFinishCreate}
      autoComplete='off'
    >
      <Typography.Text>Extra details are required for a new track. Please complete the following:</Typography.Text>
      <Form.Item<NewTrackProps>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter track name!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<NewTrackProps>
        label='Short Name'
        name='shortName'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter abbreviated track name!' }]}
      >
        <Space.Compact>
          <Input maxLength={4} />
        </Space.Compact>
      </Form.Item>

      <Form.Item<NewTrackProps>
        label='Year'
        name='year'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter Year for data' }]}
      >
        <InputNumber min={2020} max={2040} changeOnWheel />
      </Form.Item>

      <Form.Item<NewTrackProps>
        label='Month'
        name='month'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter Month for data' }]}
      >
        <InputNumber min={1} max={12} changeOnWheel  />
      </Form.Item>

      <Form.Item<NewTrackProps>
        label='Environment'
        name='symbol'
        style={itemStyle}
        rules={[{ required: true, message: 'Please specify the environment for the track' }]}
      >
        <Select options={symbolOptions}  />
      </Form.Item>

      <Form.Item<NewTrackProps>
        label='Colour'
        name='color'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter track color' }]}
      >
        <ColorPicker presets={presetColors} disabledFormat showText={false} disabledAlpha format='hex' trigger='hover'  />
      </Form.Item>

      <Form.Item label={null}>
        <Button type='text' onClick={cancel}>
          Cancel
        </Button>
        <Button type='primary' htmlType='submit'>
          Create
        </Button>
      </Form.Item>
    </Form>,
    }
  ];


  return (
    <Modal
      title=''
      className='load-track-modal'
      open={visible}
      onCancel={cancel}
      footer={[]}
      maskClosable={false}
      destroyOnClose={true} // set to true, in order to re-generate track ids
    >
      <Tabs defaultActiveKey='1' items={tabs}>
      </Tabs>
    </Modal>
  )
}
