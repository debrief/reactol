import { Feature, Point } from 'geojson'
import { Button, Checkbox, Form, Input, Modal, Transfer } from 'antd'
import { Key, useMemo, useState } from 'react'
import { GroupProps } from '../../types'
import { useAppSelector } from '../../state/hooks'
import { TrackIcon, BuoyFieldIcon, ZoneIcon, PointIcon } from '../Layers/NodeIcons'
import { TRACK_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE } from '../../constants'

export interface GroupFormProps {
  group: Feature<Point, GroupProps>
  onChange: (group: Feature<Point, GroupProps>) => void
}

export const GroupForm: React.FC<GroupFormProps> = ({ group, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const features = useAppSelector(state => state.fColl.features)
  
  const transferData = useMemo(() => {
    // Get all features that could be added to the group
    const nonGroupFeatures = features.filter(f => f.properties?.dataType !== 'group')
    
    // Create transfer data structure
    const transferData = nonGroupFeatures.map(f => ({
      key: f.id as string,
      title: f.properties?.name || 'Unnamed',
      description: f.properties?.dataType || 'Unknown type',
      type: f.properties?.dataType,
      color: f.properties?.color
    }))
    return transferData
  }, [features])

  const handleFormChange = (values: Partial<GroupProps>) => {
    const newVal = {...group, properties: {...group.properties}}
    if (values.visible) {
      newVal.properties.visible = values.visible as boolean
    }
    if (values.name) {
      newVal.properties.name = values.name as string
    }
    if (values.units) {
      newVal.properties.units = values.units as string[]
    }
    onChange(newVal)
  }

  const handleTransferChange = (targetKeys: Key[]): void => {
    const newGroup = {
      ...group,
      properties: {
        ...group.properties,
        units: targetKeys as string[]
      }
    }
    onChange(newGroup)
  }

  // Get names of current units for display
  const unitNames = group.properties.units
    .map(id => {
      const feature = features.find(f => f.id === id)
      return feature?.properties?.name || 'Unknown'
    })
    .filter(Boolean)

  const itemStyle = { marginBottom: '0.5em' }

  return (
    <div>
      <Form
        name='groupForm'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 400 }}
        initialValues={group.properties}
        onValuesChange={handleFormChange}
        size='small'
      >
        <Form.Item<GroupProps>
          label="Name"
          name="name"
          style={itemStyle}
          rules={[{ required: true, message: 'Please enter group name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<GroupProps>
          label="Visible"
          name="visible"
          style={itemStyle}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        <Form.Item<GroupProps>
          label="Units"
          style={itemStyle}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {unitNames.length === 0 ? (
                <span style={{ color: '#999' }}>No units selected</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {unitNames.map((name, index) => (
                    <div key={index}>{name}</div>
                  ))}
                </div>
              )}
            </div>
            <Button size="small" onClick={() => setIsModalOpen(true)}>
              Edit Units
            </Button>
          </div>
        </Form.Item>
      </Form>

      <Modal
        title={`Edit Units in ${group.properties.name}`}
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Transfer
          dataSource={transferData}
          showSearch
          titles={['Available', 'Selected']}
          targetKeys={group.properties.units as string[]}
          onChange={handleTransferChange}
          render={item => (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.type === TRACK_TYPE && <TrackIcon color={item.color} />}
              {item.type === BUOY_FIELD_TYPE && <BuoyFieldIcon color={item.color} />}
              {item.type === ZONE_TYPE && <ZoneIcon color={item.color} />}
              {item.type === REFERENCE_POINT_TYPE && <PointIcon color={item.color} />}
              {item.title}
            </span>
          )}
          listStyle={{
            width: 300,
            height: 400,
          }}
        />
      </Modal>
    </div>
  )
}
