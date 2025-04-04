import React, { useCallback, useMemo, useState } from 'react'
// TreeDataNode is used in the useMemo type
import './index.css'
// TRACK_TYPE is now used in useTrackManagement
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import { EnvOptions } from '../../types'
import { useTranslation } from 'react-i18next'
// These components are now used in LayersToolbar
import { AddZoneShape } from './AddZoneShape'
import { LayersToolbar } from './LayersToolbar'
import { useFeatureCreation } from './useFeatureCreation'
import { useKeyboardHandlers } from './useKeyboardHandlers'
import { useSelectionHandlers } from './useSelectionHandlers'
// Track management is now handled directly in the component

import { selectFeatures } from '../../state/geoFeaturesSlice'
import { useAppContext } from '../../state/AppContext'

// DirectoryTree has been moved to TreeView component
import { FolderOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { FeatureIcon } from './FeatureIcon'

import { HandleAddFunction, TreeDataBuilder, IconCreators } from './TreeDataBuilder'
import { TreeView } from './TreeView'
import {
  NODE_TRACKS,
  NODE_FIELDS,
  NODE_ZONES,
  NODE_POINTS,
  NODE_BACKDROPS
} from './constants'

interface LayerProps {
  openGraph: { (): void }
  splitterWidths: number
}

// justLeaves has been moved to useSelectionHandlers

// Components have been moved to their own files

const Layers: React.FC<LayerProps> = ({ openGraph, splitterWidths }) => {
  const { t } = useTranslation()
  const treeRef = React.useRef<HTMLDivElement>(null)
  const { selection, setSelection, setNewFeature, preview, setMessage, time } = useDocContext()
  const { setClipboardUpdated } = useAppContext()
  const features = useAppSelector(selectFeatures)
  // Model data is derived from features and handlers
  // Track management is handled by a custom hook
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS, 'nav'])
  const [useTimeFilter, setUseTimeFilter] = useState(false)

  const theFeatures = preview ? preview.data.features : features

  const selectedFeatures = theFeatures.filter((feature) =>
    selection.includes(feature.id as string)
  )
  
  // Use the selection handlers hook to manage selection operations
  const { onCopyClick, onDeleteClick, clearSelection, onSelect } = useSelectionHandlers({
    features,
    selection,
    setSelection,
    setMessage,
    setClipboardUpdated
  })

  // Use custom hook for keyboard shortcuts
  useKeyboardHandlers({
    selection,
    onDeleteClick,
    onCopyClick,
    clearSelection,
    elementRef: treeRef
  })


  const temporalFeatureSelected = useMemo(
    () => selectedFeatures.some((feature) => feature.properties?.times),
    [selectedFeatures]
  )

  const isExpanded = useMemo(() => expandedKeys.length > 0, [expandedKeys])

  // Use the feature creation hook to get methods for creating new features
  const { addBackdrop, addPoint, addZone, addBuoyField } = useFeatureCreation(setNewFeature, setSelection)



  // Track management state
  const [pendingTrack, setPendingTrack] = useState<EnvOptions | null>(null)

  const handleAdd: HandleAddFunction = useCallback(
    (e: React.MouseEvent, key: string, title: string) => {
      if (key === NODE_TRACKS) {
        // special case - the environment is passed in title
        setPendingTrack(title as EnvOptions)
      } else if (key === NODE_FIELDS) {
        addBuoyField()
      } else if (key === NODE_POINTS) {
        addPoint()
      } else if (key === NODE_ZONES) {
        throw new Error('This method not responsible for adding zones')

      } else if (key === NODE_BACKDROPS) {
        addBackdrop()  
      } else {
        console.error(
          'unknown key for create new item ' + key + ' for ' + title
        )
      }
      e.stopPropagation()
    }, [addBuoyField, addPoint, addBackdrop, setPendingTrack]) 

  // Create icon creators for TreeDataBuilder. We've done this so
  // that TreeDataBuilder is plain `.ts`, and can be covered by
  // unit tests
  const iconCreators = useMemo<IconCreators>(() => ({
    createFolderIcon: () => <FolderOutlined />,
    createFeatureIcon: (dataType, color, environment) => <FeatureIcon dataType={dataType} color={color} environment={environment} />,
    createAddIcon: (key, title, handleAdd) => (
      <Tooltip title={TreeDataBuilder.addIconLabelFor(key, title)}>
        <PlusCircleOutlined
          className="add-icon"
          style={{ cursor: 'copy' }}
          onClick={(e: React.MouseEvent) => handleAdd(e, key, title)}
        />
      </Tooltip>
    ),
    createTitleElement: (title) => <span>{title}</span>
  }), [])

  // Use useMemo to create the model data only when dependencies change
  const model = useMemo(() => {
    const filterForTime = time.filterApplied && useTimeFilter

    const zonesIcon = TreeDataBuilder.getIcon(
      undefined, 
      NODE_ZONES, 
      t('layers.zones'), 
      handleAdd, 
      iconCreators,
      <AddZoneShape addZone={addZone} />
    )

    // Use TreeDataBuilder.buildTreeModel to construct the tree model with time filtering
    const modelData = TreeDataBuilder.buildTreeModel(
      theFeatures, 
      handleAdd,
      iconCreators,
      filterForTime, 
      useTimeFilter ? time.start : 0, 
      useTimeFilter ? time.end : 0,
      zonesIcon,
      {
        units: t('layers.units'),
        buoyFields: t('layers.fields'),
        zones: t('layers.zones'),
        referencePoints: t('layers.points'),
        backgrounds: t('layers.backdrops')
      }
    )

    const validModels = modelData.filter(node => node !== null)
    
    return validModels
  }, [theFeatures, handleAdd, addZone, useTimeFilter, time.start, time.end, time.filterApplied, iconCreators, t])

  // onSelect is now provided by useSelectionHandlers

  // Track management functions are now provided by useTrackManagement
  return (
    <>
      <LayersToolbar 
        onCollapse={() => setExpandedKeys([])} 
        onClearSelection={clearSelection}
        onDelete={onDeleteClick}
        onGraph={openGraph}
        isExpanded={isExpanded}
        hasSelection={selection.length > 0}
        hasTemporalFeature={temporalFeatureSelected}
        hasTimeFilter={useTimeFilter}
        onFilterForTime={setUseTimeFilter}
      />
      <TreeView
        treeData={model}
        selectedKeys={selection}
        expandedKeys={expandedKeys}
        onSelect={onSelect}
        onExpand={(keys: string[]) => setExpandedKeys(keys)}
        maxHeight={splitterWidths}
        treeRef={treeRef}
      />
      {pendingTrack && (
        <LoadTrackModel
          visible={pendingTrack !== null}
          environment={pendingTrack}
          cancel={() => setPendingTrack(null)}
          newTrack={() => setPendingTrack(null)}
          addToTrack={() => {}}
          createTrackOnly={true}
        />
      )}
    </>
  )
}

export default Layers
