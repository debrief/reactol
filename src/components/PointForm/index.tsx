import { Feature, Point } from "geojson";
import { PointProps } from "../../types";
import { Form, Input } from "antd";


export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {

  const localChange = (values: string) => {
    console.log('values changed', values, onChange)
  }

  return (
    <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 400 }}
      initialValues={point.properties}
      autoComplete='off'
      onChange={localChange}
    >

      <Form.Item<PointProps>
        label='Name'
        name='name'
        rules={[{ required: true, message: 'Please enter track name!' }]}
      >
        <Input />
      </Form.Item>

    </Form>
  )
}