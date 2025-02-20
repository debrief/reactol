import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Flex, Modal, Tooltip, Tree } from 'antd'
import type { GetProps, TreeDataNode } from 'antd'
import './index.css'
import {
  LineChartOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  ShrinkOutlined,
  FolderOutlined,
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
} from '../../types'
import { CopyButton } from './CopyButton'
import { PasteButton } from './PasteButton'
import { AddZoneShape } from './AddZoneShape'
import { zoneFeatureFor } from '../../helpers/zoneShapePropsFor'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { noop } from 'lodash'

interface LayerProps {
  openGraph: { (): void }
}

type TreeProps = GetProps<typeof Tree>

type FieldDataNode = {
  title: string
  key: string
  children: FieldDataNode[]
}

const cleanGroup = (key: Key) => {
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

const getIcon = (feature: Feature | undefined, 
  key:string, title: string,
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void, button?: React.ReactNode) => {
  // If no feature is provided, this is a parent node - show plus icon
  if (!feature) {
    return button || <PlusCircleOutlined
      style={{ cursor: 'copy' }}
      onClick={(e) => handleAdd(e, key, title)}
    />
  }

  // For leaf nodes, show type-specific icon based on dataType
  const dataType = feature.properties?.dataType
  const color = feature.properties?.stroke
  const environment = feature.properties?.env
  return getFeatureIcon({ dataType, color, environment }) || <FolderOutlined />
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
  return feature.properties?.name || feature.id
}

const isChecked = (feature: Feature): string => {
  return feature.properties?.visible
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
        size={'small'}
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

  const NODE_TRACKS = 'node-tracks'
  const NODE_FIELDS = 'node-fields'

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  const [message, setMessage] = React.useState<string>('')
  const [createTrackDialogVisible, setcreateTrackDialogVisible] =
    useState(false)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])

  const clearSelection = () => {
    setSelection([])
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
        setcreateTrackDialogVisible(true)
      } else if (key === NODE_FIELDS) {
        addBuoyField()
      } else if (key === 'node-points') {
        addPoint()
      } else if (key === 'node-zones') {
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
    items.push(mapFunc(features, 'Tracks', NODE_TRACKS, TRACK_TYPE, handleAdd))
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
    if (features) {
      const checked: string[] = features
        .filter((feature) => isChecked(feature))
        .map((feature) => idFor(feature))
      // we also have to find group features, then create checked ids for their visible units
      const groupFeatures = features.filter(
        (feature) => feature.properties?.dataType === GROUP_TYPE
      )
      groupFeatures.forEach((groupFeature) => {
        const props = groupFeature.properties as GroupProps
        props.units.forEach((unitId) => {
          if (checked.includes(unitId as string)) {
            checked.push(groupIdFor(groupFeature, unitId as string))
          }
        })
      })
      setCheckedKeys(checked)
    }
  }, [features, handleAdd, addZone])

  const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
    const newKeysArr = selectedKeys as string[]
    const cleaned = newKeysArr.filter(justLeaves).filter(cleanGroup)
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned as string[])
    }
  }

  const onCheck: TreeProps['onCheck'] = (
    checked: Key[] | { checked: Key[]; halfChecked: Key[] }
  ) => {
    const newKeysArr = checked as string[]

    // diff the new keys from the checked keys, to see if items have been removed
    const removedKeys = checkedKeys.filter((key) => !newKeysArr.includes(key))
    if (removedKeys.length !== 0) {
      const justNodes = removedKeys.filter(justLeaves)
      const removeGroups = justNodes.filter(cleanGroup)
      // if it is the key for an item in a group, then we have to extract the feature id
      const action = {
        type: 'fColl/featuresVisChange',
        payload: { ids: removeGroups, visible: false },
      }
      dispatch(action)
    } else {
      // see if any keys have been added
      const addedKeys = newKeysArr.filter((key) => !checkedKeys.includes(key))
      if (addedKeys.length !== 0) {
        const cleanKeys = addedKeys.filter(justLeaves).filter(cleanGroup)
        const dedupedKeys = [...new Set(cleanKeys)]
        const action = {
          type: 'fColl/featuresVisChange',
          payload: { ids: dedupedKeys, visible: true },
        }
        dispatch(action)
      }
    }
  }

  const temporalFeatureSelected = useMemo(
    () => selectedFeatures.some((feature) => feature.properties?.times),
    [selectedFeatures]
  )

  const onGraphClick = () => {
    openGraph()
  }

  const onDeleteClick = () => {
    dispatch({
      type: 'fColl/featuresDeleted',
      payload: { ids: selection },
    })
    setSelection([])
  }

  const setLoadTrackResults = async (values: NewTrackProps) => {
    setcreateTrackDialogVisible(false)
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
    setcreateTrackDialogVisible(false)
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
          </Button.Group>
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
        </Flex>
      </div>
      {model.length > 0 && (
        <Tree
          checkable
          showLine={true}
          defaultSelectedKeys={[]}
          defaultCheckedKeys={[]}
          multiple={true}
          onSelect={onSelect}
          onCheck={onCheck}
          showIcon={true}
          checkedKeys={checkedKeys}
          selectedKeys={selectionWithGroups || []}
          expandedKeys={expandedKeys}
          onExpand={(keys) => {
            setExpandedKeys(keys as string[])
          }}
          treeData={model}
        />
      )}
      {createTrackDialogVisible && (
        <LoadTrackModel
          visible={createTrackDialogVisible}
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
