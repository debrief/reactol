import { Feature, Point, Position } from "geojson";
import { PointProps } from "../../types";
import { Form, Input } from "antd";
import { useState } from "react";


export interface PointFormProps {
  point: Feature<Point, PointProps>
  onChange: (point: Feature<Point, PointProps>) => void
}

type PointPropsWithCoords = PointProps & {
  coords: Position
}

export const PointForm: React.FC<PointFormProps> = ({point, onChange}) => {
  const [state] = useState<PointPropsWithCoords>({
    ...point.properties,
    coords: point.geometry.coordinates
  })

  const localChange = (event: Partial<PointPropsWithCoords>) => {
    const newVal = {...point, name: event.name}
    console.log('values changed', event.name, !!onChange, !!newVal)
    onChange(newVal)
  }
  console.log('name', state.name)

  return (
    <Form
      name='createTrack'
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 400 }}
      initialValues={state}
      autoComplete='off'
      clearOnDestroy={true}
      onValuesChange={localChange}
    >
      <Form.Item<PointProps>
        label='Name'
        name='name'
        rules={[{ required: true, message: 'A name is required' }]}
      >
        <Input />
      </Form.Item>

    </Form>
  )
}