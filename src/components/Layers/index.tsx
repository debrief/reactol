import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import type { TreeDataNode } from 'antd'
import './index.css'
import { TRACK_TYPE } from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector, useAppDispatch } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import {
  NewTrackProps,
  TrackProps,
  EnvOptions
} from '../../types'
// These components are now used in LayersToolbar
import { AddZoneShape } from './AddZoneShape'
import { LayersToolbar } from './LayersToolbar'
import { useFeatureCreation } from './useFeatureCreation'

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

// filter out the branches, just leave the leaves
const justLeaves = (id: Key): boolean => {
  return !(id as string).startsWith('node-')
}

// Components have been moved to their own files

const Layers: React.FC<LayerProps> = ({ openGraph, splitterWidths }) => {
  const treeRef = React.useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const { selection, setSelection, setNewFeature, preview, setMessage } = useDocContext()
  const { setClipboardUpdated } = useAppContext()
  const features = useAppSelector(selectFeatures)
  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [pendingTrack, setPendingTrack] = useState<EnvOptions | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS, 'nav'])

  const theFeatures = preview ? preview.data.features : features

  const selectedFeatures = theFeatures.filter((feature) =>
    selection.includes(feature.id as string)
  )
  
  const onCopyClick = useCallback(() => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      setClipboardUpdated(clipboardUpdated => !clipboardUpdated)
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
    })
  }, [features, selection, setClipboardUpdated, setMessage])

  const onDeleteClick = useCallback(() => {
    dispatch({
      type: 'fColl/featuresDeleted',
      payload: { ids: selection },
    })
    setSelection([])
  }, [dispatch, selection, setSelection])

  const clearSelection = useCallback(() => {
    setSelection([])
  }, [setSelection])

  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selection.length > 0) {
        // support delete key
        if (e.key === 'Delete') {
          onDeleteClick()
          e.stopPropagation()
        }
        // clear selection on `escape`
        if (e.key === 'Escape') {
          clearSelection()
          e.stopPropagation()
        }
        // copy items to clipboard on `copy`
        if (e.key === 'c' && e.ctrlKey) {
          onCopyClick()
          e.stopPropagation()
        }
      }
    }

    const treeElement = treeRef.current
    if (treeElement) {
      treeElement.addEventListener('keydown', handleKeyDown)
      return () => {
        treeElement.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selection, onDeleteClick, onCopyClick, setMessage, clearSelection, setSelection, setClipboardUpdated])


  const temporalFeatureSelected = useMemo(
    () => selectedFeatures.some((feature) => feature.properties?.times),
    [selectedFeatures]
  )

  const onGraphClick = () => {
    openGraph()
  }

  const isExpanded = useMemo(() => expandedKeys.length > 0, [expandedKeys])

  // Use the feature creation hook to get methods for creating new features
  const { addBackdrop, addPoint, addZone, addBuoyField } = useFeatureCreation(setNewFeature, setSelection)



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
    }, [addBuoyField, addPoint, addBackdrop]) 

  useEffect(() => {
    // Use TreeDataBuilder.buildTreeModel to construct the tree model
    const modelData = TreeDataBuilder.buildTreeModel(theFeatures, handleAdd)
    
    // Add the custom button for zones
    const zonesNode = modelData.find(node => node.key === NODE_ZONES)
    if (zonesNode) {
      zonesNode.icon = TreeDataBuilder.getIcon(undefined, NODE_ZONES, 'Zones', handleAdd, 
        <AddZoneShape addZone={addZone} />)
    }
    
    setModel(modelData)
  }, [theFeatures, handleAdd, addZone])

  const onSelect = (selectedKeys: React.Key[]) => {
    const cleaned = selectedKeys.filter(key => justLeaves(key))
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned.map(key => key.toString()))
    }
  }

  const setLoadTrackResults = async (values: NewTrackProps) => {
    setPendingTrack(null)
    // props in NewTrackProps format to TrackProps format, where they have different type
    const newValues = values as unknown as TrackProps
    newValues.labelInterval = parseInt(values.labelInterval)
    newValues.symbolInterval = parseInt(values.symbolInterval)
    const newTrack = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
      properties: {
        ...newValues,
        dataType: TRACK_TYPE,
        times: [],
        courses: [],
        speeds: [],
      },
    }
    dispatch({
      type: 'fColl/featureAdded',
      payload: newTrack,
    })
  }

  const handleDialogCancel = () => {
    setPendingTrack(null)
  }
  return (
    <>
      <LayersToolbar 
        onCollapse={() => setExpandedKeys([])} 
        onClearSelection={clearSelection}
        onDelete={onDeleteClick}
        onGraph={onGraphClick}
        isExpanded={isExpanded}
        hasSelection={selection.length > 0}
        hasTemporalFeature={temporalFeatureSelected}
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
