import { Feature, LineString } from "geojson";
import { Checkbox, ColorPicker, Flex, Form, Input, Select } from "antd";
import { Color } from "antd/es/color-picker";
import { useEffect, useState } from "react";
import { TrackProps } from "../../types";
import { presetColors } from "../../helpers/standardShades";
import './index.css';

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

  const intervals = [
    { label: '1m', value: '' + 1000 * 60 },
    { label: '5m', value: '' + 5 * 1000 * 60 },
    { label: '10m', value: '' + 10 * 1000 * 60 },
    { label: '15m', value: '' + 15 * 1000 * 60 },
    { label: '30m', value: '' + 30 * 1000 * 60 },
    { label: '1h', value: '' + 60 * 1000 * 60 },
    { label: '2h', value: '' + 2 * 60 * 1000 * 60 },
    { label: '6h', value: '' + 6 * 60 * 1000 * 60 }
  ]

  return (
    <>
      <Form
        name='createTrack'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
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
          style={itemStyle}
          label='Markers'>
          <Flex gap='small'>
            <Form.Item<TrackProps>
              label='Labels'
              className="labelInterval"
              name='labelInterval'
              style={itemStyle}>
              <Select options={intervals} size='small' style={{width:'60px'}} />
            </Form.Item>
            <Form.Item<TrackProps>
              label='Symbols'
              name='symbolInterval'
              className="labelSymbol"
              style={itemStyle}>
              <Select options={intervals} size='small' style={{width:'60px'}} />
            </Form.Item>
          </Flex>
        </Form.Item>  
        <Form.Item<TrackProps>
          label="Color"
          name='color'
          style={itemStyle}
          rules={[{ required: true, message: 'color is required!' }]}>
          <ColorPicker format='hex' trigger='click' presets={presetColors} />
        </Form.Item>
      </Form>
    </>
  )
}

