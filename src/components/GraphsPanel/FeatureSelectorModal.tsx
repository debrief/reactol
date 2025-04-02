import { Modal, Transfer, Space } from 'antd'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { useMemo, useState } from 'react'

interface FeatureSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSave: (tracks: string[]) => void
  defaults: string[]
  features: Feature<Geometry, GeoJsonProperties>[]
}

export const FeatureSelectorModal: React.FC<FeatureSelectorModalProps> = ({isOpen, title, onSave, onClose, features, defaults}) => { 
  const [selectedTracks, setSelectedTracks] = useState<string[]>(defaults)
  const dataSource = useMemo(() => features.map(option => ({
    key: option.id,
    title: option.properties?.name || option.id,
    description: option.properties?.dataType,
    disabled: false
  })), [features])
  if (!isOpen) return null

  return <Modal
    title={title}
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
    destroyOnClose
  >
    <Transfer
      dataSource={dataSource}
      titles={['Available', 'Selected']}
      targetKeys={selectedTracks}
      onChange={(nextTargetKeys) => {
        console.log('nextTargetKeys', nextTargetKeys)
        setSelectedTracks(nextTargetKeys as string[])
      }}
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