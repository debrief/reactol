import React, { useEffect } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import './Layers.css';
import { Feature, FeatureCollection} from 'geojson'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../constants';

export interface LayersProps {
  store: FeatureCollection | undefined
  setSelected: (ids: string[]) => void
  setChecked: (ids: string[]) => void
}

const Layers: React.FC<LayersProps> = ({store, setSelected, setChecked}) => {
  
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
        children: store?.features.filter((feature) => filterFor(feature, TRACK_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      },
      {
        title: 'Zones',
        key: 'node-zones',
        children: store?.features.filter((feature) => filterFor(feature, ZONE_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      },
      {
        title: 'Points',
        key: 'node-points',
        children: store?.features.filter((feature) => filterFor(feature, REFERENCE_POINT_TYPE)).map((item) => ({
          title: nameFor(item),
          key: idFor(item),
          children: []
        }))
      }
    ]
    setModel(modelData)
    if (store) {
      const checked: string[] = store.features.filter((feature) => isChecked(feature)).map((feature) => idFor(feature))
      setCheckedKeys(checked)
    }
  }, [store])
  
  // filter out the branches, just leave the leaves
  const justLeaves = (ids: string[]): string[] => {
    return ids.filter((id) => !id.startsWith('node-'))
  }
  
  const onSelect: TreeProps['onSelect'] = (selectedKeys) => {
    setSelected(justLeaves(selectedKeys as string[]))
  };
  
  const onCheck: TreeProps['onCheck'] = (checkedKeys,) => {
    setChecked(justLeaves(checkedKeys as string[]))
  };
  
  return <Tree checkable
    defaultExpandedKeys={['0-0-0', '0-0-1']}
    defaultSelectedKeys={['0-0-0', '0-0-1']}
    defaultCheckedKeys={['0-0-0', '0-0-1']}
    onSelect={onSelect}
    onCheck={onCheck}
    checkedKeys={checkedKeys}
    treeData={model} />
}

export default Layers;