import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Flex, Modal, Tooltip, Tree } from 'antd'
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
import { Feature, Geometry, MultiPoint, Point } from 'geojson'
import {
  BUOY_FIELD_TYPE,
  GROUP_TYPE,
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
  GroupProps,
  BuoyFieldProps,
  EnvOptions,
} from '../../types'
import { CopyButton } from './CopyButton'
import { PasteButton } from './PasteButton'
import { AddZoneShape } from './AddZoneShape'
import { zoneFeatureFor } from '../../helpers/zoneShapePropsFor'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { noop } from 'lodash'
import { symbolOptions } from '../../helpers/symbolTypes'

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>
const { DirectoryTree } = Tree

const NODE_TRACKS = 'node-tracks'
const NODE_FIELDS = 'node-fields'
const NODE_ZONES = 'node-zones'
const NODE_POINTS = 'node-points'
const NODE_GROUPS = 'node-groups'

type FieldDataNode = {
  title: string
  key: string
  children: FieldDataNode[]
}

interface LayerProps {
  openGraph: { (): void }
}

const notGroups = (key: Key) => {
  return (key as string).indexOf(':') === -1
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

const findChildrenOfGroup = (features: Feature[]): TreeDataNode[] => {
  const items = features.filter(
    (feature) => feature.properties?.dataType === GROUP_TYPE
  )
  return items.map((item): TreeDataNode => {
    const props = item.properties as GroupProps
    const children = features.filter((feature) =>
      props.units.includes(feature.id as string)
    )
    const childFeatures = children.map(child => features.find(f => idFor(f) === child.id)) as Feature[]
    return {
      title: nameFor(item),
      key: item.id as string,
      children: childFeatures.map((child: Feature): TreeDataNode => {
        return {
          title: nameFor(child),
          key: groupIdFor(item, child.id as string),
          icon: getIcon(child, groupIdFor(item, child.id as string), nameFor(child), noop, undefined),
          children: [],
        }
      }),
    }
  })
}

const groupIdFor = (parent: Feature, child?: string): string => {
  return `${parent.id || 'unknown'}:${child || 'unknown'}`
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
  case NODE_GROUPS: {
    return 'Create new group'
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
    ? dType === GROUP_TYPE
      ? findChildrenOfGroup(features).map(child => {
        // For group children, we need to find the actual feature they reference
        const referencedFeature = features.find(f => idFor(f) === child.key)
        // and the child units of this group
        return {
          ...child,
          icon: getIcon(referencedFeature, child.key as string, child.title as string, handleAdd, button),
        }
      })
      : findChildrenOfType(features, dType).map(child => {
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

const Layers: React.FC<LayerProps> = ({ openGraph }) => {
  const { selection, setSelection, setNewFeature } = useDocContext()
  const features = useAppSelector((state) => state.fColl.features)
  const selectedFeatures = features.filter((feature) =>
    selection.includes(feature.id as string)
  )
  const dispatch = useAppDispatch()

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [message, setMessage] = React.useState<string>('')
  const [pendingTrackEnvironment, setPendingTrackEnvironment] =
    useState<EnvOptions | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])

  const clearSelection = () => {
    setSelection([])
  }

  const temporalFeatureSelected = useMemo(
    () => selectedFeatures.some((feature) => feature.properties?.times),
    [selectedFeatures]
  )

  const onGraphClick = () => {
    openGraph()
  }

  const selectionWithGroups = useMemo(() => {
    const fullList = [...selection]
    const groups = features.filter(
      (feature) => feature.properties?.dataType === GROUP_TYPE
    ) as unknown as Feature<Geometry, GroupProps>[]
    selection.forEach((id: string) => {
      // find the groups that include this feature id
      const groupsContainingFeature = groups.filter((group) =>
        group.properties.units.some((unit: string | number) => unit === id)
      )
      const groupIds = groupsContainingFeature.map(
        (group) => (group.id + ':' + id) as string
      )
      fullList.push(...groupIds)
    })
    return fullList
  }, [selection, features])

  const isExpanded = useMemo(() => expandedKeys.length, [expandedKeys])

  const localSetNewFeature = useCallback((feature: Feature) => {
    setSelection([])
    setNewFeature(feature)
  }, [setNewFeature, setSelection])

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

  const addGroup = useCallback(() => {
    const group: Feature<Geometry, GroupProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: GROUP_TYPE,
        units: [],
        visible: true,
      },
      geometry: {
        type: 'GeometryCollection',
        geometries: [],
      },
    }
    localSetNewFeature(group)
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
      } else if (key === 'node-groups') {
        addGroup()
      } else {
        console.error(
          'unknown key for create new item ' + key + ' for ' + title
        )
      }
      e.stopPropagation()
    }, [addGroup, addBuoyField, addPoint]) 

  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(trackFunc(features, handleAdd))
    items.push(
      mapFunc(features, 'Buoy Fields', NODE_FIELDS, BUOY_FIELD_TYPE, handleAdd)
    )
    items.push(mapFunc(features, 'Zones', 'node-zones', ZONE_TYPE, handleAdd, 
      <AddZoneShape addZone={addZone} />))
    items.push(
      mapFunc(
        features,
        'Points',
        'node-points',
        REFERENCE_POINT_TYPE,
        handleAdd
      )
    )
    items.push(
      mapFunc(features, 'Groups', 'node-groups', GROUP_TYPE, handleAdd)
    )
    const modelData = items
    setModel(modelData)
  }, [features, handleAdd, addZone])

  const onSelect: DirectoryTreeProps['onSelect'] = (selectedKeys) => {
    const newKeysArr = selectedKeys as string[]
    const cleaned = newKeysArr.filter(justLeaves).filter(notGroups)
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned as string[])
    }
  }

  const onDeleteClick = () => {
    dispatch({
      type: 'fColl/featuresDeleted',
      payload: { ids: selection },
    })
    setSelection([])
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
      <Modal
        title='Message'
        open={message !== ''}
        onOk={() => setMessage('')}
        onCancel={() => setMessage('')}
      >
        <Alert type='info' description={message} />
      </Modal>
      <div
        style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}
      >
        <Flex
          className='toolbar'
          gap='small'
          justify='end'
          wrap
          style={{ height: '1em' }}
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
        <DirectoryTree
          showLine={true}
          style={{ textAlign: 'left', height: '100%' }}
          defaultSelectedKeys={[]}
          multiple={true}
          onSelect={onSelect}
          showIcon={true}
          selectedKeys={selectionWithGroups || []}
          expandedKeys={expandedKeys}
          onExpand={(keys) => {
            setExpandedKeys(keys as string[])
          }}
          treeData={model}
        />
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
