import React, { Key, useEffect } from 'react';
import { Button, Flex, Tree } from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import './Layers.css';
import { LineChartOutlined } from '@ant-design/icons';
import { Feature } from 'geojson'
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppSelector, useAppDispatch } from '../app/hooks';

interface LayerProps {
  openGraph: {(): void}
}

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;

const { DirectoryTree } = Tree;

const Layers: React.FC<LayerProps> = ({openGraph}) => {
  const { selection, setSelection } = useAppContext();
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatures = features.filter(feature => selection.includes(feature.id as string))
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
  const justLeaves = (ids: Key[]): Key[] => {
    return ids.filter((id) => !(id as string).startsWith('node-'))
  }
  
  const onSelect: DirectoryTreeProps['onSelect'] = (selectedKeys ) => {
    const payload = { selected: justLeaves(selectedKeys) as string[] };
    // check if the payload selection is different from the current selection
    if (JSON.stringify(payload.selected) !== JSON.stringify(selection)) {
      setSelection(payload.selected);
    }
  };
  
  const onCheck: DirectoryTreeProps['onCheck'] = (checkedKeys) => {
    const keys = justLeaves(checkedKeys as Key[])
    dispatch({type: 'featureCollection/featuresVisible', payload: {ids: keys}})
  };

  const temporalFeatureSelected = (): boolean => {
    return  selectedFeatures.some((feature) => feature.properties?.times)
  }

  const onGraphClick = () => {
    openGraph()
  }
  
  return <>
    <Flex gap='small' justify='end' wrap>
      <Button onClick={onGraphClick} disabled={!temporalFeatureSelected()} type="primary"><LineChartOutlined /></Button>
    </Flex>
    <DirectoryTree checkable
      defaultExpandedKeys={[]}
      defaultSelectedKeys={[]}
      defaultCheckedKeys={[]}
      multiple={true}
      onSelect={onSelect}
      onCheck={onCheck}
      showIcon={false}
      checkedKeys={checkedKeys}
      selectedKeys={selection || []}
      treeData={model} />
    </>
}

export default Layers;
