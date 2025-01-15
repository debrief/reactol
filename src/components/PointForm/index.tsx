import { Feature, Point, Position } from "geojson";
import { PointProps } from "../../types";
import { Checkbox, ColorPicker, Form, Input } from "antd";
import { Color } from "antd/es/color-picker";


export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

type PointsWithCoords = PointProps & {
  coords: Position
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {

  const localChange = (values: Partial<PointsWithCoords>) => {
    if (values.color) {
      values.color = (values.color as unknown as Color).toHexString()
    }
    const updatedProps = {...point.properties, ...values}
    const newVal = {...point, properties: updatedProps} as Feature<Point, PointProps>
    onChange(newVal)
  }

  return (
    <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 400 }}
      initialValues={ {...point.properties, coords: point.geometry.coordinates} as PointsWithCoords }
      autoComplete='off'
      onValuesChange={localChange}
    >

      <Form.Item<PointsWithCoords>
        label='Name'
        name='name'
        rules={[{ required: true, message: 'Please enter track name!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<PointsWithCoords>
        label='Visible'
        name='visible'
        valuePropName="checked" 
      >
        <Checkbox />
      </Form.Item>
      <Form.Item<PointsWithCoords>
        name="color"
        label="Color"
        rules={[{ required: true, message: 'color is required!' }]}>
        <ColorPicker format='hex' trigger='click' />
      </Form.Item>

    </Form>
  )
}