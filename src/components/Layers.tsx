import React, { Key, useEffect } from 'react';
import { Button, Flex, Tree } from 'antd';
import type { GetProps, TreeDataNode } from 'antd';
import './Layers.css';
import { LineChartOutlined } from '@ant-design/icons';
import { Feature } from 'geojson';
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppSelector, useAppDispatch } from '../app/hooks';

interface LayerProps {
  openGraph: {(): void}
}

const ROOT_ID = '-root-'

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

const mapFunc = (features: Feature[], title: string, key: string, dType: string): TreeDataNode => {
  return {
    title: title,
    key: key,
    children: features.filter((feature) => filterFor(feature, dType)).map((item) => ({
      title: nameFor(item),
      key: idFor(item),
      children: []
    }))
  }
}

const Layers: React.FC<LayerProps> = ({openGraph}) => {
  const { selection, setSelection } = useAppContext();
  const features = useAppSelector(state => state.featureCollection.features)
  const selectedFeatures = features.filter(feature => selection.includes(feature.id as string))
  const dispatch = useAppDispatch()

  const [model, setModel] = React.useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([])
  
  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(mapFunc(features, 'Tracks', 'node-tracks', TRACK_TYPE))
    items.push(mapFunc(features, 'Zones', 'node-zones', ZONE_TYPE))
    items.push(mapFunc(features, 'Points', 'node-points', REFERENCE_POINT_TYPE))
    const modelData = {
      title: 'Serial',
      key: ROOT_ID,
      children: items }
    setModel([modelData])
    if (features) {
      const checked: string[] = features.filter((feature) => isChecked(feature)).map((feature) => idFor(feature))
      setCheckedKeys(checked)
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

  const temporalFeatureSelected = (): boolean => {
    return selectedFeatures.some((feature) => feature.properties?.times)
  }

  const onGraphClick = () => {
    openGraph()
  }

  return <>
    <Flex gap='small' justify='end' wrap>
      <Button onClick={onGraphClick} disabled={!temporalFeatureSelected()} type="primary"><LineChartOutlined /></Button>
    </Flex>
    <Tree checkable
      defaultExpandedKeys={[]}
      defaultSelectedKeys={[]}
      defaultCheckedKeys={[]}
      multiple={true}
      onSelect={onSelect}
      onCheck={onCheck}
      showIcon={true}
      checkedKeys={checkedKeys}
      selectedKeys={selection || []}
      treeData={model} />
    </>
}

export default Layers;
