import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Flex, Modal, Tooltip, Tree } from 'antd'
import type { GetProps, TreeDataNode } from 'antd'
import './index.css'
import {
  LineChartOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  CopyOutlined,
  CloseCircleOutlined,
  ShrinkOutlined,
} from '@ant-design/icons'
import { Feature, Geometry, Point, Polygon } from 'geojson'
import { GROUP_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../constants'
import { useAppContext } from '../../state/AppContext'
import { useAppSelector, useAppDispatch } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import { NewTrackProps, TrackProps, CoreShapeProps, ZoneProps, PointProps, GroupProps } from '../../types'
import { PointForm } from '../PointForm'

interface LayerProps {
  openGraph: { (): void }
}

type TreeProps = GetProps<typeof Tree>


type FieldDataNode = {
  title: string
  key: string
  children: FieldDataNode[]
}

const findChildrenOfType = (features: Feature[], dType: string): FieldDataNode[] => {
  const items = features.filter((feature) => feature.properties?.dataType === dType)
  return items.map((item) => ({
    title: nameFor(item),
    key: item.id as string,
    children: []
  }))
}

const findChildrenOfGroup = (features: Feature[]): FieldDataNode[] => {
  const items = features.filter((feature) => feature.properties?.dataType === GROUP_TYPE)
  return items.map((item): FieldDataNode => {
    const props = item.properties as GroupProps
    const children = features.filter((feature) => props.units.includes(feature.id as string))
    return {
      title: nameFor(item),
      key: item.id as string,
      children: children.map((child): FieldDataNode => {
        return {
          title: nameFor(child) + child.id as string,
          key: groupIdFor(item, child.id as string),
          children: []
        }
      })
    }
  })
}

const groupIdFor = (parent: Feature, child?: string): string => {
  return `${parent.id || 'unknown'}:${child || 'unknown'}`
}

const mapFunc = (
  features: Feature[],
  title: string,
  key: string,
  dType: string,
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void
): TreeDataNode => {
  const children = dType !== GROUP_TYPE ? findChildrenOfType(features, dType) : findChildrenOfGroup(features)
  return {
    title: title,
    key: key,
    icon: (
      <PlusCircleOutlined
        style={{ cursor: 'copy' }}
        onClick={(e) => handleAdd(e, key, title)}
      />
    ),
    children: children
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

interface ToolProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
  disabled: boolean
}

const ToolButton: React.FC<ToolProps> = ({
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
  const { selection, setSelection } = useAppContext()
  const features = useAppSelector((state) => state.fColl.features)
  const selectedFeatures = features.filter((feature) =>
    selection.includes(feature.id as string)
  )
  const dispatch = useAppDispatch()

  const NODE_TRACKS = 'node-tracks'

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  const [message, setMessage] = React.useState<string>('')
  const [createTrackDialogVisible, setcreateTrackDialogVisible] = useState(false)
  const [newPoint, setNewPoint] = useState<Feature<Geometry, CoreShapeProps> | null>(null)
  const [workingPoint, setWorkingPoint] = useState<Feature<Geometry, CoreShapeProps> | null>(null)
  const [formType, setFormType] = useState<string>('')
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])

  const clearSelection = () => {
    setSelection([])
  }

  const isExpanded = useMemo(() => expandedKeys.length, [expandedKeys])

  const addPoint = () => {
    const point: Feature<Point, PointProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: REFERENCE_POINT_TYPE,
        color: '#FF0000',
        visible: true
      },
      geometry: {
        type: 'Point',
        coordinates: []
      }
    }
    setFormType('point')
    setWorkingPoint(point)
    setNewPoint(point)
  }

  const addZone = () => {
    const zone: Feature<Polygon, ZoneProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: ZONE_TYPE,
        color: '#FF0000',
        visible: true
      },
      geometry: {
        type: 'Polygon',
        coordinates: []
      }
    }
    setFormType('zone')
    setWorkingPoint(zone)
    setNewPoint(zone)
  }

  const addGroup = () => {
    setMessage('Adding group')
  }

  const handleAdd = useCallback( (e: React.MouseEvent, key: string, title: string) => {
    if (key === NODE_TRACKS) {
      setcreateTrackDialogVisible(true)
    } else if (key === 'node-points') {
      addPoint()
    } else if (key === 'node-zones') {
      addZone()
    } else if (key === 'node-groups') {
      addGroup()
    } else {
      console.error('unknown key for create new item ' + key + ' for ' + title)
    }
    e.stopPropagation()
  }, [])

  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(mapFunc(features, 'Tracks', NODE_TRACKS, TRACK_TYPE, handleAdd))
    items.push(mapFunc(features, 'Zones', 'node-zones', ZONE_TYPE, handleAdd))
    items.push(mapFunc(features, 'Points', 'node-points', REFERENCE_POINT_TYPE, handleAdd))
    items.push(mapFunc(features, 'Groups', 'node-groups', GROUP_TYPE, handleAdd))
    const modelData = items
    setModel(modelData)
    if (features) {
      const checked: string[] = features
        .filter((feature) => isChecked(feature))
        .map((feature) => idFor(feature))
      // we also have to find group features, then create checked ids for their visible units
      const groupFeatures = features.filter((feature) => feature.properties?.dataType === GROUP_TYPE)
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
  }, [features, handleAdd])

  // filter out the branches, just leave the leaves
  const justLeaves = (ids: Key[]): Key[] => {
    return ids.filter((id) => !(id as string).startsWith('node-'))
  }

  const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
    const payload = { selected: justLeaves(selectedKeys) as string[] }
    // check if the payload selection is different from the current selection
    if (JSON.stringify(payload.selected) !== JSON.stringify(selection)) {
      setSelection(payload.selected)
    }
  }

  const onCheck: TreeProps['onCheck'] = (checkedKeys) => {
    const keys = justLeaves(checkedKeys as Key[])
    console.log('keys, checkedKeys', keys, checkedKeys)
    // if it is the key for an item in a group, then we have to extract the feature id
    const removeGroupBits = keys.map((key) => {
      const colonIndex = (key as string).indexOf(':')
      if (colonIndex === -1) return key
      return (key as string).substring(colonIndex + 1)
    })
    const action = {
      type: 'fColl/featureVisibilities',
      payload: { ids: removeGroupBits },
    }
    // check if the payload selection is different from the current selection
    dispatch(action)
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

  const onDuplicateClick = () => {
    dispatch({
      type: 'fColl/featuresDuplicated',
      payload: { ids: selection },
    })
  }

  const duplicateDisabled = useMemo(
    () =>
      selection.length === 0 ||
      !!selection.find(
        (id) =>
          features.find((feature) => feature.id === id)?.properties
            ?.dataType === TRACK_TYPE
      ),
    [selection, features]
  )

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

  const handlePointSave = () => {
    dispatch({ type: 'fColl/featureAdded', payload: workingPoint })
    setNewPoint(null)
    setWorkingPoint(null)
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
      <div style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
        <Flex className='toolbar' gap='small' justify='end' wrap style={{ height: '1em' }}>
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
            <ToolButton
              onClick={onDuplicateClick}
              disabled={duplicateDisabled}
              icon={<CopyOutlined />}
              title={
                selection.length > 0
                  ? 'Duplicate selected items'
                  : 'Select non-track items to enable duplicate'
              }
            />
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
          selectedKeys={selection || []}
          expandedKeys={expandedKeys}
          onExpand={(keys) => {
            setExpandedKeys(keys as string[])
          }}
          treeData={model}
        />
      )}
      {createTrackDialogVisible && (
        <LoadTrackModel
          open={createTrackDialogVisible}
          cancel={handleDialogCancel}
          newTrack={setLoadTrackResults}
          addToTrack={() => {}}
          createTrackOnly={true}
        />
      )}
      { newPoint && <Modal
        title={'Create new ' + formType}
        open={true}
        onCancel={() => setNewPoint(null)}
        onOk={handlePointSave}>
        <PointForm
          shape={newPoint}
          onChange={(point) => setWorkingPoint(point)}
        />
      </Modal>}
    </>
  )
}

export default Layers
