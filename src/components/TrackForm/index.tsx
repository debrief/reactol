import { Feature, LineString } from "geojson";
import { Checkbox, ColorPicker, Form, Input } from "antd";
import { Color } from "antd/es/color-picker";
import { useEffect, useState } from "react";
import { TrackProps } from "../../types";
import { presetColors } from "../../helpers/standardShades";

export interface TrackFormProps {
  track: Feature<LineString, TrackProps>
  onChange: (point: Feature<LineString, TrackProps>) => void
}

export const TrackForm: React.FC<TrackFormProps> = ({track, onChange}) => {
  const [state, setState] = useState<TrackProps | null>(null)

  useEffect(() => {
    if (track) {
      setState(track.properties)
    }
  }, [track, setState])

  const localChange = (values: Partial<TrackProps>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps= {...state, ...values} as TrackProps
    const res = {...track, properties: updatedProps}
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
      <Form.Item<TrackProps>
        label='Name'
        name='name'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter track name!' }]}>
        <Input/>
      </Form.Item>
      <Form.Item<TrackProps>
        label='Short name'
        name='shortName'
        style={itemStyle}
        rules={[{ required: true, message: 'Please enter short name!' }]}>
        <Input/>
      </Form.Item>
      <Form.Item<TrackProps>
        label='Visible'
        name={'visible'}
        style={itemStyle}
        valuePropName="checked" >
        <Checkbox style={{alignItems: 'start'}}  />
      </Form.Item>
      <Form.Item<TrackProps>
        label="Color"
        name='color'
        style={itemStyle}
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' presets={presetColors} />
      </Form.Item>
    </Form>
  )
}

