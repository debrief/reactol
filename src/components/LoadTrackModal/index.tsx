import {
  Button,
  ColorPicker,
  Flex,
  Form,
  FormProps,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tabs,
  TabsProps,
  Typography,
} from "antd";
import { Color } from "antd/es/color-picker";
import { presetColors } from "../../helpers/standardShades";
import { useAppSelector } from "../../state/hooks";
import { AddTrackProps, NewTrackProps } from "../../types";
import { defaultIntervals } from "../../helpers/timeIntervals";
import "./index.css";
import { symbolOptions } from "../../helpers/symbolTypes";

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
  addToTrack,
}) => {
  // collate a list of existing tracks, in case user wants to add data to existing track
  const features = useAppSelector((state) => state.featureCollection.features)
  const trackOptions = features
    .filter((feature) => feature.properties?.dataType === "track")
    .map((feature) => ({
      value: feature.id,
      label: feature.properties?.name || feature.id,
    }))

  const initialYear = new Date().getFullYear()
  const initialMonth = new Date().getMonth() + 1
  const itemStyle = { marginBottom: 0 }


  const onFinishAdd: FormProps<AddTrackProps>["onFinish"] = (id) => {
    addToTrack(id.trackId)
  }

  const onFinishCreate: FormProps<NewTrackProps>["onFinish"] = (values) => {
    // see if we have to conver the color to rgb string, check if
    // values.color is an object with a color property
    if (typeof values.color === "object") {
      const colorValue = values.color as Color
      values.color = colorValue.toRgbString()
    }
    newTrack(values)
  }

  const initialNewTrackValues: Partial<NewTrackProps> = {
    year: initialYear,
    month: initialMonth,
    symbol: symbolOptions[0].value,
    color: presetColors[0].colors[0] as string,
    labelInterval: '' + Number(defaultIntervals[5].value),
    symbolInterval: '' + Number(defaultIntervals[4].value),
  }

  const tabs: TabsProps["items"] = [
    {
      key: "add",
      label: "Add to existing track",
      children: (
        <Form
          name='addToTrack'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          style={{ maxWidth: 400 }}
          onFinish={onFinishAdd}
          autoComplete='off'
          disabled={trackOptions.length === 0}
        >
          { trackOptions.length ? <Typography.Text>
            Select a track to add data to, from the list below:
          </Typography.Text> : <Typography.Text>
            No tracks available to add to. Please load as a new track.
          </Typography.Text>  } 
          <Form.Item<AddTrackProps>
            label='Track'
            name='trackId'
            style={itemStyle}
            rules={[
              {
                required: true,
                message: "Please indicate which track to add data to",
              },
            ]}
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
        </Form>
      ),
    },
    {
      key: "create",
      label: "Create new track",
      children: (
        <Form
          name='createTrack'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          style={{ maxWidth: 400 }}
          initialValues={initialNewTrackValues}
          onFinish={onFinishCreate}
          autoComplete='off'
        >
          <Typography.Text>
            Extra details are required for a new track. Please complete the
            following:
          </Typography.Text>
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
            rules={[
              {
                required: true,
                message: "Please enter abbreviated track name!",
              },
            ]}
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
            <InputNumber min={1} max={12} changeOnWheel />
          </Form.Item>

          <Form.Item<NewTrackProps>
            label='Environment'
            name='symbol'
            style={itemStyle}
            rules={[
              {
                required: true,
                message: "Please specify the environment for the track",
              },
            ]}
          >
            <Select options={symbolOptions} />
          </Form.Item>

          <Form.Item<NewTrackProps>
            label='Colour'
            name='color'
            style={itemStyle}
            rules={[{ required: true, message: "Please enter track color" }]}
          >
            <ColorPicker
              presets={presetColors}
              disabledFormat
              showText={false}
              disabledAlpha
              format='hex'
              trigger='hover'
            />
          </Form.Item>
          <Form.Item<NewTrackProps>
            style={itemStyle}
            label='Markers'>
            <Flex gap='small'>
              <Form.Item<NewTrackProps>
                label='Labels'
                className="labelInterval"
                name='labelInterval'
                style={itemStyle}>
                <Select options={defaultIntervals} size='small' style={{width:'70px'}} />
              </Form.Item>
              <Form.Item<NewTrackProps>
                label='Symbols'
                name='symbolInterval'
                className="labelSymbol"
                style={itemStyle}>
                <Select options={defaultIntervals} size='small' style={{width:'70px'}} />
              </Form.Item>
            </Flex>
          </Form.Item>  
          

          <Form.Item style={itemStyle} label={null}>
            <Button type='text' onClick={cancel}>
              Cancel
            </Button>
            <Button type='primary' htmlType='submit'>
              Create
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

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
      <Tabs defaultActiveKey={trackOptions.length > 0 ? 'add' : 'create'} items={tabs}></Tabs>
    </Modal>
  )
}
