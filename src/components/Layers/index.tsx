import React, { Key, useEffect, useMemo, useState } from 'react'
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
import { Feature } from 'geojson'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../constants'
import { useAppContext } from '../../state/AppContext'
import { useAppSelector, useAppDispatch } from '../../state/hooks'
import { LoadTrackModel } from '../LoadTrackModal'
import { NewTrackProps, TrackProps } from '../../types'

interface LayerProps {
  openGraph: { (): void }
}

type TreeProps = GetProps<typeof Tree>

const idFor = (feature: Feature): string => {
  return `${feature.id || 'unknown'}`
}

const nameFor = (feature: Feature): string => {
  return feature.properties?.name || feature.id
}

const isChecked = (feature: Feature): string => {
  return feature.properties?.visible
}

const filterFor = (feature: Feature, dType: string): boolean => {
  return feature.properties?.dataType === dType
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
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])

  const clearSelection = () => {
    setSelection([])
  }

  const isExpanded = useMemo(() => expandedKeys.length, [expandedKeys])

  const mapFunc = (
    features: Feature[],
    title: string,
    key: string,
    dType: string
  ): TreeDataNode => {
    const handleAdd = (e: React.MouseEvent, key: string, title: string) => {
      if (key === NODE_TRACKS) {
        setcreateTrackDialogVisible(true)
      } else {
        setMessage('TODO - handle creating new item in ' + title)
      }
      e.stopPropagation()
    }
    return {
      title: title,
      key: key,
      icon: (
        <PlusCircleOutlined
          style={{ cursor: 'copy' }}
          onClick={(e) => handleAdd(e, key, title)}
        />
      ),
      children: features
        .filter((feature) => filterFor(feature, dType))
        .map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: [],
        })),
    }
  }
  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(mapFunc(features, 'Tracks', NODE_TRACKS, TRACK_TYPE))
    items.push(mapFunc(features, 'Zones', 'node-zones', ZONE_TYPE))
    items.push(mapFunc(features, 'Points', 'node-points', REFERENCE_POINT_TYPE))
    const modelData = items
    setModel(modelData)
    if (features) {
      const checked: string[] = features
        .filter((feature) => isChecked(feature))
        .map((feature) => idFor(feature))
      setCheckedKeys(checked)
      // this would expand all top level items
      // const expanded: string[] = items.map(item => item.key as string); // include top level keys
    }
  }, [features])

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
    dispatch({
      type: 'fColl/featureVisibilities',
      payload: { ids: keys },
    })
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

  const handleDialogCancel = () => {
    setcreateTrackDialogVisible(false)
  }
  return (
    <>
      <Modal
        title='Message'
        visible={message !== ''}
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
      <LoadTrackModel
        visible={createTrackDialogVisible}
        cancel={handleDialogCancel}
        newTrack={setLoadTrackResults}
        addToTrack={() => {}}
        createTrackOnly={true}
      />
    </>
  )
}

export default Layers
