import { Modal, Transfer, Space } from 'antd'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { useState } from 'react'

interface FeatureSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tracks: string[]) => void
  defaults: string[]
  features: Feature<Geometry, GeoJsonProperties>[]
}

export const FeatureSelectorModal: React.FC<FeatureSelectorModalProps> = ({isOpen, onClose, onSave, defaults, features}) => { 
  const [selectedTracks, setSelectedTracks] = useState<string[]>(defaults)
  
  return <Modal
    title="Manage Secondary Tracks"
    open={isOpen}
    onOk={() => {
      onSave(selectedTracks)
      onClose()
    }}
    onCancel={onClose}
    width={600}
    modalRender={(modal) => (
      <div onWheel={(e) => e.stopPropagation()}>
        {modal}
      </div>
    )}
  >
    <Transfer
      dataSource={features.map(option => ({
        key: option.id,
        title: option.properties?.name || option.id,
        description: option.properties?.dataType,
        disabled: false
      }))}
      titles={['Available', 'Selected']}
      targetKeys={selectedTracks}
      onChange={(nextTargetKeys) => setSelectedTracks(nextTargetKeys as string[])}
      render={item => (
        <Space>
          {features.find(opt => opt.id === item.key)?.properties?.icon}
          {item.title}
          <span style={{ color: '#999', fontSize: '12px' }}>{item.description}</span>
        </Space>
      )}
      listStyle={{
        width: 250,
        height: 300,
      }}
      showSearch
      filterOption={(inputValue, item) =>
        item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
        item.description.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
    />
  </Modal>
}