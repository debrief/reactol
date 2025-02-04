import { Modal, Form, InputNumber, Row, Col, Button } from 'antd'
import { Position } from 'geojson'
import { ZoneShapeProps } from '../../zoneShapeTypes'
import {
  CIRCLE_SHAPE,
  CIRCULAR_RING_SHAPE,
  CIRCULAR_SECTOR_SHAPE,
  POLYGON_SHAPE,
  RECTANGLE_SHAPE,
  SECTION_CIRCULAR_RING_SHAPE,
} from '../../constants'
import { CoordinateInput } from './CoordinateInput'
import { useMemo, useState } from 'react'
import { ZoneShapes } from '../Layers/zoneShapeConstants'

interface ZoneSpecificsModalProps {
  open: boolean
  onOk: (specifics: ZoneShapeProps) => void
  onCancel: () => void
  specifics: ZoneShapeProps
  coordinates?: Position[][]
}

export const ZoneSpecificsModal: React.FC<ZoneSpecificsModalProps> = ({
  open,
  onOk,
  onCancel,
  specifics,
  coordinates,
}) => {
  const [form] = Form.useForm()
  const [polygonCoordinates, setPolygonCoordinates] = useState<Position[]>(
    coordinates?.[0] || []
  )

  console.log('coordinates', coordinates)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onOk({
        ...specifics,
        ...values,
        coordinates: specifics.shapeType === POLYGON_SHAPE ? [polygonCoordinates] : coordinates,
      })
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const shapeName = useMemo(() => {
    return ZoneShapes.find((s) => s.key === specifics.shapeType)?.label
  }, [specifics.shapeType])

  const handleAddCoordinate = () => {
    setPolygonCoordinates([...polygonCoordinates, [0, 0]])
  }

  const handleDeleteCoordinate = (index: number) => {
    const newCoordinates = [...polygonCoordinates]
    newCoordinates.splice(index, 1)
    setPolygonCoordinates(newCoordinates)
  }

  const handleCoordinateChange = (index: number, value: [number, number]) => {
    const newCoordinates = [...polygonCoordinates]
    newCoordinates[index] = value
    setPolygonCoordinates(newCoordinates)
  }

  const renderFields = () => {
    switch (specifics.shapeType) {
    case RECTANGLE_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label='Top Left'
              name='topLeft'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Bottom Right'
              name='bottomRight'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
        </Row>
      )
    case CIRCLE_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label='Origin'
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Radius (m)'
              name='radiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    case CIRCULAR_RING_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label='Origin'
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Inner Radius (m)'
              name='innerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Outer Radius (m)'
              name='outerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    case SECTION_CIRCULAR_RING_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label='Origin'
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Inner Radius (m)'
              name='innerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Outer Radius (m)'
              name='outerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Start Angle'
              name='startAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='End Angle'
              name='endAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    case CIRCULAR_SECTOR_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label='Origin'
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Start Angle'
              name='startAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='End Angle'
              name='endAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    case POLYGON_SHAPE:
      return (
        <div style={{ marginBottom: 16 }}>
          <h4>Polygon Coordinates</h4>
          {polygonCoordinates.map((coord, index) => (
            <Row key={index} gutter={[16, 16]} style={{ marginBottom: 8 }}>
              <Col span={20}>
                <CoordinateInput
                  value={coord as [number, number]}
                  onChange={(value) => handleCoordinateChange(index, value)}
                />
              </Col>
              <Col span={4}>
                <Button danger onClick={() => handleDeleteCoordinate(index)}>
                  Delete
                </Button>
              </Col>
            </Row>
          ))}
          <Button type="dashed" onClick={handleAddCoordinate} style={{ width: '100%' }}>
            Add Coordinate
          </Button>
        </div>
      )
    default:
      return null
    }
  }

  return (
    <Modal
      title={'Edit Zone - ' + shapeName}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout='horizontal'
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={specifics}
      >
        {renderFields()}
      </Form>
    </Modal>
  )
}
