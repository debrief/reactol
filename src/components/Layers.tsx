import React, { Key, useEffect, useMemo } from 'react';
import { Alert, Button, Flex, Modal, Tooltip, Tree } from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import './Layers.css';
import { LineChartOutlined, PlusCircleOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { Feature } from 'geojson';
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppSelector, useAppDispatch } from '../app/hooks';

interface LayerProps {
  openGraph: {(): void}
}

const ROOT_ID = 'node-root'

type TreeProps = GetProps<typeof Tree>;

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

const Layers: React.FC<LayerProps> = ({openGraph}) => {
  const { selection, setSelection } = useAppContext();
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatures = features.filter(feature => selection.includes(feature.id as string))
  const dispatch = useAppDispatch()

  const NODE_TRACKS = 'node-tracks';

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  const [message, setMessage] = React.useState<string>('')
  const [defaultExpandedKeys, setDefaultExpandedKeys] = React.useState<string[]>([ROOT_ID]); // Add state for expanded keys
  
  const mapFunc = (features: Feature[], title: string, key: string, dType: string): TreeDataNode => {
    const handleAdd = (e: any, key: string) => {
      setMessage('TODO - handle creating new item in ' + key)
      e.stopPropagation()
    }
    return {
      title: title,
      key: key,
      icon: <PlusCircleOutlined  style={{cursor: 'copy'}} onClick={(e) => handleAdd(e, title)} />,
      children: features.filter((feature) => filterFor(feature, dType)).map((item) => ({
        title: nameFor(item),
        key: idFor(item),
        children: []
      }))
    }
  }
  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(mapFunc(features, 'Tracks', NODE_TRACKS, TRACK_TYPE))
    items.push(mapFunc(features, 'Zones', 'node-zones', ZONE_TYPE))
    items.push(mapFunc(features, 'Points', 'node-points', REFERENCE_POINT_TYPE))
    const modelData = {
      title: 'Serial',
      key: ROOT_ID,
      checkable: false,
      children: items }
    setModel([modelData])
    if (features) {
      const checked: string[] = features.filter((feature) => isChecked(feature)).map((feature) => idFor(feature))
      setCheckedKeys(checked)
      // this would expand all top level items
      // const expanded: string[] = items.map(item => item.key as string); // include top level keys
      setDefaultExpandedKeys([NODE_TRACKS]);
    }
  }, [features])
  
  // filter out the branches, just leave the leaves
  const justLeaves = (ids: Key[]): Key[] => {
    return ids.filter((id) => !(id as string).startsWith('node-'))
  }
  
  const onSelect: TreeProps['onSelect'] = (selectedKeys ) => {
    const payload = { selected: justLeaves(selectedKeys) as string[] };
    // check if the payload selection is different from the current selection
    if (JSON.stringify(payload.selected) !== JSON.stringify(selection)) {
      setSelection(payload.selected);
    }
  };
  
  const onCheck: TreeProps['onCheck'] = (checkedKeys) => {
    const keys = justLeaves(checkedKeys as Key[])
    dispatch({type: 'featureCollection/featuresVisible', payload: {ids: keys}})
  };

  const temporalFeatureSelected = useMemo(() => 
    selectedFeatures.some((feature) => feature.properties?.times)
  , [selectedFeatures])

  const onGraphClick = () => {
    openGraph()
  }

  const onDeleteClick = () => {
    dispatch({type: 'featureCollection/featuresDeleted', payload: {ids: selection}})
    setSelection([])
  }

  const onDuplicateClick = () => {
    dispatch({type: 'featureCollection/featuresDuplicated', payload: {ids: selection}})
  }

  return <>
    <Modal title="Message" visible={message !== ''} onOk={() => setMessage('')} onCancel={() => setMessage('')}>
      <Alert type="info" description={message} />
    </Modal>
    <Flex gap='small' justify='end' wrap>
      <Tooltip title={temporalFeatureSelected ? 'View graph of selected features' : 'Select a time-related feature to enable graphs'}>
        <Button onClick={onGraphClick} disabled={!temporalFeatureSelected} type="primary"><LineChartOutlined /></Button>
      </Tooltip> 
      <Tooltip title={selection.length > 0 ? 'Delete selected items' : 'Select items to enable delete'}>
        <Button onClick={onDeleteClick} disabled={selection.length === 0} type="primary"><DeleteOutlined /></Button>
      </Tooltip>
      <Tooltip title={selection.length > 0 ? 'Duplicate selected items' : 'Select items to enable duplicate'}>
        <Button onClick={onDuplicateClick} disabled={selection.length === 0} type="primary"><CopyOutlined /></Button>
      </Tooltip>
    </Flex>
    { model.length && <Tree checkable
      showLine={true}
      defaultExpandedKeys={defaultExpandedKeys} // Use expandedKeys state
      defaultSelectedKeys={[]}
      defaultCheckedKeys={[]}
      multiple={true}
      onSelect={onSelect}
      autoExpandParent={true}
      onCheck={onCheck}
      showIcon={true}
      checkedKeys={checkedKeys}
      selectedKeys={selection || []}
      treeData={model} /> }
    </>
}

export default Layers;
