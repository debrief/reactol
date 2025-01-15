import { Feature, Point, Position } from "geojson";
import { PointProps } from "../../types";
import { Form, Input } from "antd";


export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

type PointsWithCoords = PointProps & {
  coords: Position
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {

  const localChange = (values: Partial<PointsWithCoords>) => {
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

    </Form>
  )
}