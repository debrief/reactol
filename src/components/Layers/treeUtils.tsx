import { Feature } from 'geojson'
import { Tooltip, TreeDataNode } from 'antd'
import { FolderOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { getFeatureIcon } from '../../helpers/getFeatureIcon'
import { symbolOptions } from '../../helpers/symbolTypes'
import { NODE_BACKDROPS, NODE_FIELDS, NODE_POINTS, NODE_TRACKS, NODE_ZONES } from './constants'
import { DataNode } from 'antd/es/tree'
import { EnvOptions } from '../../types'

// Helper function to get feature ID
export const idFor = (feature: Feature): string => {
  return `${feature.id || 'unknown'}`
}

// Helper function to get feature name
export const nameFor = (feature: Feature): string => {
  return (feature.properties?.name || feature.id)
}

// Filter out branches, just leave leaves
export const justLeaves = (id: string): boolean => {
  return !id.startsWith('node-')
}

const addIconLabelFor = (key: string, title: string) => {
  switch(key) {
  case NODE_TRACKS: {
    // special case - get the name for the env
    const env = title as EnvOptions
    return 'Create new ' +  symbolOptions.find(e => e.value === env)?.label + ' track'
  }
  case NODE_FIELDS: {
    return 'Create new buoy field'
  }
  case NODE_ZONES: {
    return 'Create new zone'
  }
  case NODE_POINTS: {
    return 'Create new reference point'
  }

  case NODE_BACKDROPS: {
    return 'Create new backdrop'
  }
  default:
    return 'ERROR - node type not handled: ' + key
  }
}
// Get icon for tree node
export const getIcon = (
  feature: Feature | undefined, 
  key:string, title: string,
  handleAdd?: (e: React.MouseEvent, key: string, title: string) => void, 
  button?: React.ReactNode
) => {
  console.log('getting icon for 2', key, title)
  // If no feature is provided, this is a parent node - show plus icon
  if (!feature) {
    return handleAdd ? (button || <Tooltip title={addIconLabelFor(key, title)}>
      <PlusCircleOutlined
        style={{ cursor: 'copy' }}
        onClick={(e) => handleAdd(e, key, title)}
      />
    </Tooltip>) : null

  }

  // For leaf nodes, show type-specific icon based on dataType
  const dataType = feature.properties?.dataType
  const color = feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color']
  const environment = feature.properties?.env
  return getFeatureIcon({ dataType, color, environment }) || <FolderOutlined />
}

// Find children of specific type
export const findChildrenOfType = (
  features: Feature[],
  dType: string
): { title: string; key: string; children: DataNode[] }[] => {
  const items = features.filter(
    (feature) => feature.properties?.dataType === dType
  )
  return items.map((item) => ({
    title: nameFor(item),
    key: idFor(item),
    children: [],
  }))
}

// Generate track tree node
export const trackFunc = (
  features: Feature[], 
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void
): TreeDataNode => {
  // Generate new root
  const root: TreeDataNode = {
    title: 'Units',
    key: NODE_TRACKS,
    icon: <FolderOutlined/>,
    children: [],
  }
  
  const environments = symbolOptions.map((env): TreeDataNode => ({
    title: env.label,
    key: env.value,
    icon: getIcon(undefined, NODE_TRACKS, env.value, handleAdd, undefined),
    children: features
      .filter(feature => feature.properties?.env === env.value)
      .map((feature): TreeDataNode => ({
        title: nameFor(feature),
        key: idFor(feature),
        icon: getIcon(feature, idFor(feature), nameFor(feature), undefined, undefined),
        children: [],
      }))
  }))

  root.children = [...environments]
  return root
}

// Generate map function for other node types
export const mapFunc = (
  features: Feature[],
  title: string,
  key: string,
  dType: string,
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void,
  button?: React.ReactNode
): TreeDataNode => {
  const children = features
    ? findChildrenOfType(features, dType).map(child => {
      // Find the corresponding feature for this child
      const feature = features.find(f => idFor(f) === child.key)
      return {
        ...child,
        icon: getIcon(feature, child.key, child.title, handleAdd, button),
      }
    })
    : []

  return {
    title: title,
    key,
    icon: getIcon(undefined, key, title, handleAdd, button),
    children,
  }
}
