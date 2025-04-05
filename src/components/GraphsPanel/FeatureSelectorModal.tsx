import { Modal, Transfer, Space } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { featureAsOption } from './featureUtils'

interface FeatureSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  onSave: (tracks: string[]) => void
  defaults: string[]
  features: Feature<Geometry, GeoJsonProperties>[]
}

export const FeatureSelectorModal: React.FC<FeatureSelectorModalProps> = ({isOpen, title, onSave, onClose, features, defaults}) => { 
  const { t } = useTranslation()
  const [selectedTracks, setSelectedTracks] = useState<string[]>(defaults)

  const options = useMemo(() => features.map(featureAsOption), [features])

  const dataSource = useMemo(() => options.map(option => ({
    key: option.value,
    title: option.label,
    description: option.dataType,
    disabled: false
  })), [options])

  if (!isOpen) return null

  const renderItem = (item: {key: string, title: string, description: string}) => (
    <Space>
      {options.find(opt => opt.value === item.key)?.icon}
      {item.title}
      <span style={{ color: '#999', fontSize: '12px' }}>{item.description}</span>
    </Space>
  )

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
      titles={[t('graphs.available'), t('graphs.selected')]}
      targetKeys={selectedTracks}
      onChange={(nextTargetKeys) => setSelectedTracks(nextTargetKeys as string[])}
      render={renderItem}
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