import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Flex, Tooltip, Tree } from 'antd'
import type { GetProps, TreeDataNode } from 'antd'
import './index.css'
import {
  PlusCircleOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  ShrinkOutlined,
  FolderOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
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
import { CopyButton } from './CopyButton'
import { PasteButton } from './PasteButton'
import { AddZoneShape } from './AddZoneShape'
import { zoneFeatureFor } from '../../helpers/zoneShapePropsFor'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'

import { symbolOptions } from '../../helpers/symbolTypes'
import { selectFeatures } from '../../state/geoFeaturesSlice'
import { useAppContext } from '../../state/AppContext'

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>
const { DirectoryTree } = Tree

const NODE_TRACKS = 'node-tracks'
const NODE_FIELDS = 'node-fields'
const NODE_ZONES = 'node-zones'
const NODE_POINTS = 'node-points'

const NODE_BACKDROPS = 'node-backdrops'

type FieldDataNode = {
  title: string
  key: string
  children: FieldDataNode[]
}

interface LayerProps {
  openGraph: { (): void }
  splitterWidths: number
}

const findChildrenOfType = (
  features: Feature[],
  dType: string
): FieldDataNode[] => {
  const items = features.filter(
    (feature) => feature.properties?.dataType === dType
  )
  return items.map((item) => ({
    title: nameFor(item),
    key: item.id as string,
    children: [],
  }))
}



const addIconLabelFor = (key: string, title: string) => {
  switch(key) {
  case NODE_TRACKS: {
    // special case - get the name for the env
    const env = title as EnvOptions
    return 'Create new ' +  symbolOptions.find(e => e.value === env)?.label + ' track'
  }
  case NODE_FIELDS: {
    return 'Create new buoy field'
  }
  case NODE_ZONES: {
    return 'Create new zone'
  }
  case NODE_POINTS: {
    return 'Create new reference point'
  }

  case NODE_BACKDROPS: {
    return 'Create new backdrop'
  }
  default:
    return 'ERROR - node type not handled: ' + key
  }
}

const getIcon = (feature: Feature | undefined, 
  key:string, title: string,
  handleAdd?: (e: React.MouseEvent, key: string, title: string) => void, button?: React.ReactNode) => {
  // If no feature is provided, this is a parent node - show plus icon
  if (!feature) {
    return handleAdd ? (button || <Tooltip title={addIconLabelFor(key, title)}>
      <PlusCircleOutlined
        style={{ cursor: 'copy' }}
        onClick={(e) => handleAdd(e, key, title)}
      />
    </Tooltip>) : null
  }

  // For leaf nodes, show type-specific icon based on dataType
  const dataType = feature.properties?.dataType
  const color = feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color']
  const environment = feature.properties?.env
  return getFeatureIcon({ dataType, color, environment }) || <FolderOutlined />
}

const trackFunc = (features: Feature[], handleAdd: (e: React.MouseEvent, key: string, title: string) => void): TreeDataNode => {
  // generate new root
  const root: TreeDataNode = {
    title: 'Units',
    key: NODE_TRACKS,
    icon: <FolderOutlined />,
    children: [],
  }
  const environments = symbolOptions.map((env): TreeDataNode => ({
    title: env.label,
    key: env.value,
    icon: getIcon(undefined, NODE_TRACKS, env.value, handleAdd, undefined),
    children: features.filter(feature => feature.properties?.env === env.value).map((feature): TreeDataNode => ({
      title: nameFor(feature),
      key: idFor(feature),
      icon: getIcon(feature, idFor(feature), nameFor(feature), undefined, undefined),
      children: [],
    }))
  }))

  root.children = root.children ? root.children.concat(...environments) : [...environments]
  return root
}

const mapFunc = (
  features: Feature[],
  title: string,
  key: string,
  dType: string,
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void,
  button?: React.ReactNode
): TreeDataNode => {

  const children = features
    ? findChildrenOfType(features, dType).map(child => {
      // Find the corresponding feature for this child
      const feature = features.find(f => idFor(f) === child.key)
      return {
        ...child,
        icon: getIcon(feature, child.key, child.title, handleAdd, button),
      }
    })
    : []

  return {
    title: (
      <span>
        {title}
      </span>
    ),
    key,
    icon: getIcon(undefined, key, title, handleAdd, button), // Parent node gets plus icon
    children,
  }
}

const idFor = (feature: Feature): string => {
  return `${feature.id || 'unknown'}`
}

const nameFor = (feature: Feature): string => {
  return (feature.properties?.name || feature.id)
  // return (feature.properties?.name || feature.id) + ' : ' + feature.id
}

// filter out the branches, just leave the leaves
const justLeaves = (id: Key): boolean => {
  return !(id as string).startsWith('node-')
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
  const { selection, setSelection, setNewFeature, preview, setMessage } = useDocContext()
  const {clipboardUpdated, setClipboardUpdated} = useAppContext()
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
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])

  const onCopyClick = useCallback(() => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      setClipboardUpdated(!clipboardUpdated)
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
    })
  }, [features, selection, clipboardUpdated, setClipboardUpdated, setMessage])

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

  const isExpanded = useMemo(() => expandedKeys.length, [expandedKeys])

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



  const handleAdd = useCallback(
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
    items.push(trackFunc(theFeatures, handleAdd))
    items.push(
      mapFunc(theFeatures, 'Buoy Fields', NODE_FIELDS, BUOY_FIELD_TYPE, handleAdd)
    )
    items.push(mapFunc(theFeatures, 'Zones', 'node-zones', ZONE_TYPE, handleAdd, 
      <AddZoneShape addZone={addZone} />))
    items.push(
      mapFunc(
        theFeatures,
        'Points',
        'node-points',
        REFERENCE_POINT_TYPE,
        handleAdd
      )
    )

    items.push(mapFunc(theFeatures, 'Backdrops', NODE_BACKDROPS, BACKDROP_TYPE, handleAdd))
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
