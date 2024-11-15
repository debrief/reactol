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
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])

  const idFor = (node: React.ReactElement): string => {
    return node.props.children.props.data.id
  }

  const isChecked = (node: React.ReactElement): string => {
    return node.props.checked
  }

  useEffect(() => {
    const modelData: TreeDataNode[] = [
      {
        title: 'Tracks',
        key: 'node-tracks',
        children: tracks.map((track, index) => ({
          title: `Track-${index}`,
          key: idFor(track),
          children: []
        }))
      },
      {
        title: 'Zones',
        key: 'node-zones',
        children: zones.map((zone, index) => ({
          title: `Zone-${index}`,
          key: idFor(zone),
          children: []
        }))
      },
      {
        title: 'Points',
        key: 'node-points',
        children: points.map((point, index) => ({
          title: `Point-${index}`,
          key: idFor(point),
          children: []
        }))
      }
    ]
    setModel(modelData)
    const checked: string[] = []
    checked.push(...tracks.filter((item) => isChecked(item)).map((item) => idFor(item)))
    checked.push(...zones.filter((item) => isChecked(item)).map((item) => idFor(item)))
    checked.push(...points.filter((item) => isChecked(item)).map((item) => idFor(item)))
    setCheckedKeys(checked)
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
      checkedKeys={checkedKeys}
      treeData={model} />
}

export default Layers;