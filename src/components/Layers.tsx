import React, { useEffect } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import './Layers.css';

export interface LayersProps {
  zones: React.ReactElement[]
  tracks: React.ReactElement[]
  points: React.ReactElement[]
  setSelected: (ids: string[]) => void
  setChecked: (ids: string[]) => void
}

const Layers: React.FC<LayersProps> = ({zones, tracks, points, setSelected, setChecked}) => {

  const [model, setModel] = React.useState<TreeDataNode[]>([])

  useEffect(() => {
    console.log('tracks', tracks[0])
    const modelData: TreeDataNode[] = [
      {
        title: 'Tracks',
        key: 'node-tracks',
        children: tracks.map((track, index) => ({
          title: `Track-${index}`,
          key: `track-${index}`,
          children: []
        }))
      },
      {
        title: 'Zones',
        key: 'node-zones',
        children: zones.map((zone, index) => ({
          title: `Zone-${index}`,
          key: `zone-${index}`,
          children: []
        }))
      },
      {
        title: 'Points',
        key: 'node-points',
        children: points.map((point, index) => ({
          title: `Point-${index}`,
          key: `point-${index}`,
          children: []
        }))
      }
    ]
    setModel(modelData)
  }, [zones, tracks, points])

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

  return <Tree style={{border: 'red 2px solid'}} checkable
      defaultExpandedKeys={['0-0-0', '0-0-1']}
      defaultSelectedKeys={['0-0-0', '0-0-1']}
      defaultCheckedKeys={['0-0-0', '0-0-1']}
      onSelect={onSelect}
      onCheck={onCheck}
      treeData={model} />
}

export default Layers;