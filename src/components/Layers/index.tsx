import React, { useCallback, useMemo, useState } from 'react'
// TreeDataNode is used in the useMemo type
import './index.css'
// TRACK_TYPE is now used in useTrackManagement
import { useDocContext } from '../../state/DocContext'
import { useAppSelector } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import { EnvOptions } from '../../types'
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

import { HandleAddFunction, TreeDataBuilder } from './TreeDataBuilder'
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
  const treeRef = React.useRef<HTMLDivElement>(null)
  const { selection, setSelection, setNewFeature, preview, setMessage } = useDocContext()
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

  // Use useMemo to create the model data only when dependencies change
  const model = useMemo(() => {
    // Use TreeDataBuilder.buildTreeModel to construct the tree model
    const modelData = TreeDataBuilder.buildTreeModel(theFeatures, handleAdd)
    
    // Add the custom button for zones
    const zonesNode = modelData.find(node => node.key === NODE_ZONES)
    if (zonesNode) {
      zonesNode.icon = TreeDataBuilder.getIcon(undefined, NODE_ZONES, 'Zones', handleAdd, 
        <AddZoneShape addZone={addZone} />)
    }
    
    return modelData
  }, [theFeatures, handleAdd, addZone])

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
