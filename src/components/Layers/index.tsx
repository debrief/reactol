import React from 'react'
import { Button, Flex, Tooltip, Tree } from 'antd'
import type { GetProps } from 'antd'
import './index.css'
import {
  DeleteOutlined,
  CloseCircleOutlined,
  ShrinkOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { useAppSelector } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import { CopyButton } from './CopyButton'
import { PasteButton } from './PasteButton'
import { selectFeatures } from '../../state/geoFeaturesSlice'

// Import types
import { EnvOptions } from '../../types'

// Import context hooks
import { useDocContext } from '../../state/DocContext'

// Import custom hooks
import { useFeatureManagement } from './hooks/useFeatureManagement'
import { useSelectionManagement } from './hooks/useSelectionManagement'
import { useTreeModel } from './hooks/useTreeModel'
import { useAddOperations } from './hooks/useAddOperations'

// Import utilities and constants
import { justLeaves } from './treeUtils'

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>
const { DirectoryTree } = Tree

interface LayerProps {
  openGraph: { (): void }
  splitterWidths: number
}

interface ToolProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled: boolean
}

export const ToolButton: React.FC<ToolProps> = ({
  onClick,
  icon,
  title,
  disabled,
}) => {
  return (
    <Tooltip title={title}>
      <Button
        size={'middle'}
        onClick={onClick}
        disabled={disabled}
        type='primary'
        icon={icon}
      />
    </Tooltip>
  )
}

const Layers: React.FC<LayerProps> = ({ openGraph, splitterWidths }) => {
  const features = useAppSelector(selectFeatures)
  const { preview } = useDocContext()
  const theFeatures = preview ? preview.data.features : features

  // Use feature management hook first
  const { 
    addBackdrop, 
    addPoint, 
    addZone, 
    addBuoyField, 
    setLoadTrackResults,
    deleteFeatures 
  } = useFeatureManagement()
  
  // Use selection management hook
  const { 
    selection, 
    setSelection, 
    temporalFeatureSelected, 
    clearSelection, 
    treeRef 
  } = useSelectionManagement(theFeatures)
  

  
  // Create local state to break the circular dependency
  const [pendingEnvironment, setPendingEnvironment] = React.useState<EnvOptions | null>(null)
  
  // Use add operations hook with the local state setter
  const { handleAdd } = useAddOperations(
    addBuoyField,
    addPoint,
    addBackdrop,
    setPendingEnvironment
  )
  
  // Use tree model hook with the local state
  const { 
    model, 
    expandedKeys, 
    setExpandedKeys, 
    pendingTrackEnvironment, 
    isExpanded, 
    handleDialogCancel 
  } = useTreeModel(theFeatures, handleAdd, addZone, pendingEnvironment)
  
  // Handle delete operation
  const onDeleteClick = () => {
    deleteFeatures(selection)
  }

  // Handle graph click
  const onGraphClick = () => {
    openGraph()
  }

  // Handle tree selection
  const onSelect: DirectoryTreeProps['onSelect'] = (selectedKeys) => {
    const newKeysArr = selectedKeys as string[]
    const cleaned = newKeysArr.filter(justLeaves)
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned as string[])
    }
  }
  return (
    <>
      <div
        style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}
      >
        <Flex
          className='toolbar'
          gap='small'
          justify='end'
          wrap
          style={{ marginTop: '2px', height: '0' }}
        >
          <Button.Group>
            <ToolButton
              onClick={() => setExpandedKeys([])}
              icon={<ShrinkOutlined />}
              title='Collapse All'
              disabled={!isExpanded}
            />
            <ToolButton
              onClick={clearSelection}
              disabled={selection.length === 0}
              icon={<CloseCircleOutlined />}
              title={'Clear selection'}
            />
            <ToolButton
              onClick={onDeleteClick}
              disabled={selection.length === 0}
              icon={<DeleteOutlined />}
              title={
                selection.length > 0
                  ? 'Delete selected items'
                  : 'Select items to enable delete'
              }
            />
            <CopyButton />
            <PasteButton />
            <ToolButton
              onClick={onGraphClick}
              disabled={!temporalFeatureSelected}
              icon={<LineChartOutlined />}
              title={
                temporalFeatureSelected
                  ? 'View graph of selected features'
                  : 'Select a time-related feature to enable graphs'
              }
            />
          </Button.Group>
        </Flex>
      </div>
      {model.length > 0 && (
        <div ref={treeRef} tabIndex={0} style={{ height: '100%' }}>
          <DirectoryTree
            showLine={true}
            className="tree-container"
            style={{ textAlign: 'left', height: '100%', maxHeight: splitterWidths }}
            defaultSelectedKeys={[]}
            multiple={true}
            onSelect={onSelect}
            showIcon={true}
            selectedKeys={selection || []}
            expandedKeys={expandedKeys}
            onExpand={(keys) => {
              setExpandedKeys(keys as string[])
            }}
            treeData={model}
          />
        </div>
      )}
      {pendingTrackEnvironment && (
        <LoadTrackModel
          visible={pendingTrackEnvironment !== null}
          environment={pendingTrackEnvironment}
          cancel={handleDialogCancel}
          newTrack={setLoadTrackResults}
          addToTrack={() => {}}
          createTrackOnly={true}
        />
      )}
    </>
  )
}

export default Layers
