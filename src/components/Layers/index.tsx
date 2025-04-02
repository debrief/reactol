import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Tree } from 'antd'
import type { GetProps, TreeDataNode } from 'antd'
import './index.css'
import { Feature, MultiPoint, Point } from 'geojson'
import {
  BACKDROP_TYPE,
  BUOY_FIELD_TYPE,
  REFERENCE_POINT_TYPE,
  TRACK_TYPE,
  ZONE_TYPE,
} from '../../constants'
import { useDocContext } from '../../state/DocContext'
import { useAppSelector, useAppDispatch } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import {
  NewTrackProps,
  TrackProps,
  PointProps,
  BuoyFieldProps,
  EnvOptions,
  BackdropProps,
} from '../../types'
// These components are now used in LayersToolbar
import { AddZoneShape } from './AddZoneShape'
import { LayersToolbar } from './LayersToolbar'
import { zoneFeatureFor } from '../../helpers/zoneShapePropsFor'

import { selectFeatures } from '../../state/geoFeaturesSlice'
import { useAppContext } from '../../state/AppContext'

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>
const { DirectoryTree } = Tree

import { HandleAddFunction, TreeDataBuilder } from './TreeDataBuilder'
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
  const { selection, setSelection, setNewFeature, preview, setMessage } = useDocContext()
  const { setClipboardUpdated } = useAppContext()
  const features = useAppSelector(selectFeatures)
  const theFeatures = preview ? preview.data.features : features

  const selectedFeatures = theFeatures.filter((feature) =>
    selection.includes(feature.id as string)
  )
  const dispatch = useAppDispatch()
  const treeRef = React.useRef<HTMLDivElement>(null)

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [pendingTrackEnvironment, setPendingTrackEnvironment] =
    useState<EnvOptions | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS, 'nav'])

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

  const localSetNewFeature = useCallback((feature: Feature) => {
    setSelection([])
    setNewFeature(feature)
  }, [setNewFeature, setSelection])

  const addBackdrop = useCallback(() => {
    const backdrop: Feature<MultiPoint, BackdropProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: BACKDROP_TYPE,
        visible: true,
        url: '',
        maxNativeZoom: 0,
        maxZoom: 0,
      },
      geometry: {
        type: 'MultiPoint',
        coordinates: [],
      },
    }
    localSetNewFeature(backdrop)
  }, [localSetNewFeature])

  const addPoint = useCallback(() => {
    const point: Feature<Point, PointProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: REFERENCE_POINT_TYPE,
        'marker-color': '#FF0000',
        visible: true,
      },
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    }
    localSetNewFeature(point)
  }, [localSetNewFeature])

  const addZone = useCallback((key: string): void => {
    const zone = zoneFeatureFor(key)
    localSetNewFeature(zone)
  }, [localSetNewFeature])

  const addBuoyField = useCallback(() => {
    const buoyField: Feature<MultiPoint, BuoyFieldProps> = {
      type: 'Feature',
      properties: {
        name: '',
        shortName: '',
        dataType: BUOY_FIELD_TYPE,
        'marker-color': '#FF0000',
        visible: true,
      },
      geometry: {
        type: 'MultiPoint',
        coordinates: [],
      },
    }
    localSetNewFeature(buoyField)
  }, [localSetNewFeature])



  const handleAdd: HandleAddFunction = useCallback(
    (e: React.MouseEvent, key: string, title: string) => {
      if (key === NODE_TRACKS) {
        // special case - the environment is passed in title
        setPendingTrackEnvironment(title as EnvOptions)
      } else if (key === NODE_FIELDS) {
        addBuoyField()
      } else if (key === NODE_POINTS) {
        addPoint()
      } else if (key === NODE_ZONES) {
        throw new Error('This method not responsible for adding zones')

      } else if (key === 'node-backdrops') {
        addBackdrop()  
      } else {
        console.error(
          'unknown key for create new item ' + key + ' for ' + title
        )
      }
      e.stopPropagation()
    }, [addBuoyField, addPoint, addBackdrop]) 

  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(TreeDataBuilder.buildTrackNode(theFeatures, handleAdd))
    items.push(
      TreeDataBuilder.buildTypeNode(theFeatures, 'Buoy Fields', NODE_FIELDS, BUOY_FIELD_TYPE, handleAdd)
    )
    items.push(TreeDataBuilder.buildTypeNode(theFeatures, 'Zones', NODE_ZONES, ZONE_TYPE, handleAdd, 
      <AddZoneShape addZone={addZone} />))
    items.push(
      TreeDataBuilder.buildTypeNode(
        theFeatures,
        'Points',
        NODE_POINTS,
        REFERENCE_POINT_TYPE,
        handleAdd
      )
    )

    items.push(TreeDataBuilder.buildTypeNode(theFeatures, 'Backdrops', NODE_BACKDROPS, BACKDROP_TYPE, handleAdd))
    const modelData = items
    setModel(modelData)
  }, [theFeatures, handleAdd, addZone])

  const onSelect: DirectoryTreeProps['onSelect'] = (selectedKeys) => {
    const newKeysArr = selectedKeys as string[]
    const cleaned = newKeysArr.filter(justLeaves)
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned as string[])
    }
  }



  const setLoadTrackResults = async (values: NewTrackProps) => {
    setPendingTrackEnvironment(null)
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
    setPendingTrackEnvironment(null)
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
      {model.length > 0 && (
        <div ref={treeRef} tabIndex={0} style={{ height: '100%' }}>
          <DirectoryTree
            showLine
            className="tree-container"
            style={{ textAlign: 'left', height: '100%', maxHeight: `${splitterWidths}px` }}
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
