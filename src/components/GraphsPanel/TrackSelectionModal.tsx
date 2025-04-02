import React from 'react'
import { Modal, Transfer } from 'antd'
import type { TransferItem } from 'antd/es/transfer'
import { Feature } from 'geojson'
import { FeatureIcon } from '../Layers/FeatureIcon'

interface TrackSelectionModalProps {
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  trackOptions: Feature[]
  primaryTrack: string
  secondaryTracks: string[]
  setPrimaryTrack: (id: string) => void
  setSecondaryTracks: (ids: string[]) => void
}

export const TrackSelectionModal: React.FC<TrackSelectionModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  trackOptions,
  primaryTrack,
  secondaryTracks,
  setPrimaryTrack,
  setSecondaryTracks
}) => {
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // Handle track selection changes
  const handleChange = (targetKeys: string[]) => {
    // If there's a primary track, make sure it's the first one
    if (primaryTrack && targetKeys.includes(primaryTrack)) {
      const newTargetKeys = [primaryTrack, ...targetKeys.filter(key => key !== primaryTrack)]
      setSecondaryTracks(newTargetKeys.slice(1))
    } else if (targetKeys.length > 0) {
      // If there's no primary track but there are selected tracks, set the first one as primary
      setPrimaryTrack(targetKeys[0])
      setSecondaryTracks(targetKeys.slice(1))
    } else {
      // If no tracks are selected, clear both primary and secondary
      setPrimaryTrack('')
      setSecondaryTracks([])
    }
  }

  // Render track item in the transfer component
  const renderItem = (item: TransferItem) => {
    const feature = trackOptions.find(f => f.id === item.key)
    return {
      label: (
        <span>
          <FeatureIcon dataType={feature?.properties?.dataType} color={feature?.properties?.stroke || feature?.properties?.color} environment={feature?.properties?.env} /> {item.title}
        </span>
      ),
      value: item.title || ''
    }
  }

  return (
    <Modal
      title="Select Tracks"
      open={isModalOpen}
      onOk={handleCancel}
      onCancel={handleCancel}
      width={600}
    >
      <Transfer
        dataSource={trackOptions.map(feature => ({
          key: feature.id,
          title: feature.properties?.name || 'Unnamed Track',
          chosen: primaryTrack === feature.id || secondaryTracks.includes(feature.id as string)
        }))}
        showSearch
        targetKeys={[primaryTrack, ...secondaryTracks].filter(Boolean)}
        onChange={(keys) => handleChange(keys as string[])}
        render={renderItem}
        listStyle={{
          width: 250,
          height: 300
        }}
      />
    </Modal>
  )
}
