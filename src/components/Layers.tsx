import React, { useEffect } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import './Layers.css';
import { Feature } from 'geojson'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../constants';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { SelectionState } from '../features/selection/selectionSlice';

const Layers: React.FC = () => {
  const features = useAppSelector(state => state.featureCollection.features)
  const dispatch = useAppDispatch()

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  
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
  
  useEffect(() => {
    const modelData: TreeDataNode[] = [
      {
        title: 'Tracks',
        key: 'node-tracks',
        children: features.filter((feature) => filterFor(feature, TRACK_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      },
      {
        title: 'Zones',
        key: 'node-zones',
        children: features.filter((feature) => filterFor(feature, ZONE_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      },
      {
        title: 'Points',
        key: 'node-points',
        children: features.filter((feature) => filterFor(feature, REFERENCE_POINT_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      }
    ]
    setModel(modelData)
    if (features) {
      const checked: string[] = features.filter((feature) => isChecked(feature)).map((feature) => idFor(feature))
      setCheckedKeys(checked)
    }
  }, [features])
  
  // filter out the branches, just leave the leaves
  const justLeaves = (ids: string[]): string[] => {
    return ids.filter((id) => !id.startsWith('node-'))
  }
  
  const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
    console.log('layers clicked', selectedKeys)

    const payload: SelectionState = {selected: selectedKeys as string[]}
    dispatch({type: 'selection/selectionChanged', payload})
  };
  
  const onCheck: TreeProps['onCheck'] = (checkedKeys) => {
    const keys = justLeaves(checkedKeys as string[])
    dispatch({type: 'featureCollection/featuresVisible', payload: {ids: keys}})
  };
  
  return <Tree checkable
    defaultExpandedKeys={[]}
    defaultSelectedKeys={[]}
    defaultCheckedKeys={[]}
    onSelect={onSelect}
    onCheck={onCheck}
    checkedKeys={checkedKeys}
    treeData={model} />
}

export default Layers;
