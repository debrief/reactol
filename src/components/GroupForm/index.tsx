import { Feature, Point } from 'geojson'
import { Button, Checkbox, Form, Input, Modal, Transfer } from 'antd'
import { Key, useState } from 'react'
import { GroupProps } from '../../types'
import { useAppSelector } from '../../state/hooks'

export interface GroupFormProps {
  group: Feature<Point, GroupProps>
  onChange: (group: Feature<Point, GroupProps>) => void
}

export const GroupForm: React.FC<GroupFormProps> = ({ group, onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const features = useAppSelector(state => state.fColl.features)
  
  // Get all features that could be added to the group
  const allFeatures = features.filter(f => f.properties?.dataType !== 'group')
  
  // Create transfer data structure
  const transferData = allFeatures.map(f => ({
    key: f.id as string,
    title: f.properties?.name || 'Unnamed',
    description: f.properties?.dataType || 'Unknown type'
  }))

  const handleFormChange = (values: Partial<GroupProps>) => {
    const newVal = {...group, properties: {...group.properties}}
    if (values.visible) {
      newVal.properties.visible = values.visible as boolean
    } else if (values.name) {
      newVal.properties.name = values.name as string
    } else if (values.units) {
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
        <Form.Item
          label="Name"
          name="name"
          style={itemStyle}
          rules={[{ required: true, message: 'Please enter group name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Visible"
          name="visible"
          style={itemStyle}
          valuePropName="checked"
        >
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Checkbox />
          </div>
        </Form.Item>

        <Form.Item
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
        title="Edit Group Units"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Transfer
          dataSource={transferData}
          titles={['Available', 'Selected']}
          targetKeys={group.properties.units as string[]}
          onChange={handleTransferChange}
          render={item => item.title}
          listStyle={{
            width: 300,
            height: 400,
          }}
        />
      </Modal>
    </div>
  )
}
