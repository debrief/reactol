import { Modal, Form, InputNumber, Row, Col, Button } from 'antd'
import { Position } from 'geojson'
import { ZoneShapeProps, ZoneRectangleProps, ZoneCircleProps, ZoneCircularRingProps, ZoneSectionCircularRingProps, ZoneCircularSectorProps } from '../../zoneShapeTypes'
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
import { useTranslation } from 'react-i18next'
import { ZoneShapes } from '../Layers/zoneShapeConstants'

interface ZoneSpecificsModalProps {
  open: boolean
  onOk: (specifics: ZoneShapeProps, coordinates: Position[][]) => void
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
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [polygonCoordinates, setPolygonCoordinates] = useState<Position[]>(
    coordinates?.[0] || []
  )

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const coords: Position[][] = specifics.shapeType === POLYGON_SHAPE ? [polygonCoordinates] : []
      const resultsSpecifics = {...specifics, ...values}
      onOk(resultsSpecifics, coords)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const shapeName = useMemo(() => {
    return ZoneShapes.find((s) => s.key === specifics?.shapeType)?.label
  }, [specifics?.shapeType])

  const renderFields = () => {
    switch (specifics?.shapeType) {
    case RECTANGLE_SHAPE:
      return (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item<ZoneRectangleProps>
              label={t('forms.common.topLeft')}
              name='topLeft'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<ZoneRectangleProps>
              label={t('forms.common.bottomRight')}
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
            <Form.Item<ZoneCircleProps>
              label={t('forms.common.origin')}
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<ZoneCircleProps>
              label={t('forms.common.radiusM')}
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
            <Form.Item<ZoneCircularRingProps>
              label={t('forms.common.origin')}
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<ZoneCircularRingProps>
              label={t('forms.common.innerRadiusM')}
              name='innerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<ZoneCircularRingProps>
              label={t('forms.common.outerRadiusM')}
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
            <Form.Item<ZoneSectionCircularRingProps>
              label={t('forms.common.origin')}
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneSectionCircularRingProps>
              label={t('forms.common.innerRadiusM')}
              name='innerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneSectionCircularRingProps>
              label={t('forms.common.outerRadiusM')}
              name='outerRadiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneSectionCircularRingProps>
              label={t('forms.common.startAngle')}
              name='startAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneSectionCircularRingProps>
              label={t('forms.common.endAngle')}
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
            <Form.Item<ZoneCircularSectorProps>
              label={t('forms.common.origin')}
              name='origin'
              rules={[{ required: true }]}
            >
              <CoordinateInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneCircularSectorProps>
              label={t('forms.common.startAngle')}
              name='startAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneCircularSectorProps>
              label={t('forms.common.endAngle')}
              name='endAngle'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<ZoneCircularSectorProps>
              label={t('forms.common.radiusM')}
              name='radiusM'
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    case POLYGON_SHAPE: {

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

      return (
        <div style={{ marginBottom: 16 }}>
          <h4>{t('forms.common.polygonCoordinates')}</h4>
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
                  {t('forms.core.delete')}
                </Button>
              </Col>
            </Row>
          ))}
          <Button type="dashed" onClick={handleAddCoordinate} style={{ width: '100%' }}>
            {t('forms.common.addCoordinate')}
          </Button>
        </div>
      )
    }
    default:
      return null
    }
  }

  return (
    <Modal
      title={`${t('forms.common.edit')} ${t('layers.zones')} - ${shapeName}`}
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
