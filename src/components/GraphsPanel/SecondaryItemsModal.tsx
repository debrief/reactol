import React from 'react'
import { Modal, Transfer, Space } from 'antd'
import type { TransferItem } from 'antd/es/transfer'
import { OptionType } from './types'

interface SecondaryItemsModalProps {
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  secondaryOptions: OptionType[]
  setSecondaryTracks: (ids: string[]) => void
  tempSecondaryTracks: string[]
  setTempSecondaryTracks: (ids: string[]) => void
  featureOptions: OptionType[]
}

export const SecondaryItemsModal: React.FC<SecondaryItemsModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  secondaryOptions,
  setSecondaryTracks,
  tempSecondaryTracks,
  setTempSecondaryTracks,
  featureOptions
}) => {
  // Handle modal OK
  const handleOk = () => {
    setSecondaryTracks(tempSecondaryTracks)
    setIsModalOpen(false)
  }

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <Modal
      title="Manage Secondary Items"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      modalRender={(modal: React.ReactNode) => (
        <div onWheel={(e) => e.stopPropagation()}>
          {modal}
        </div>
      )}
    >
      <Transfer
        dataSource={secondaryOptions.map(option => ({
          key: option.value,
          title: option.label,
          description: option.dataType,
          disabled: false
        }))}
        titles={['Available', 'Selected']}
        targetKeys={tempSecondaryTracks}
        onChange={(nextTargetKeys) => setTempSecondaryTracks(nextTargetKeys as string[])}
        render={(item: TransferItem) => (
          <Space>
            {featureOptions.find(opt => opt.value === item.key)?.icon}
            {item.title}
            <span style={{ color: '#999', fontSize: '12px' }}>{item.description}</span>
          </Space>
        )}
        listStyle={{
          width: 250,
          height: 300,
        }}
        showSearch
        filterOption={(inputValue: string, item: TransferItem) =>
          (item.title?.toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1 ||
          (item.description?.toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
        }
      />
    </Modal>
  )
}
