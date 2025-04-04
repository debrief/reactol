import React from 'react'
import { Feature } from 'geojson'
import { TreeDataNode } from 'antd'
import { FolderOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { FeatureIcon } from './FeatureIcon'
import { symbolOptions } from '../../helpers/symbolTypes'
import { EnvOptions, FeatureTypes } from '../../types'
import { featureIsVisibleInPeriod } from '../../helpers/featureIsVisibleAtTime'
import { BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE, BACKDROP_TYPE } from '../../constants'

// Import node constants from the constants file
import {
  NODE_TRACKS,
  NODE_FIELDS,
  NODE_ZONES,
  NODE_POINTS,
  NODE_BACKDROPS
} from './constants'

type FieldDataNode = {
  title: string
  key: string
  children: FieldDataNode[]
}

export type HandleAddFunction = (e: React.MouseEvent, key: string, title: string) => void

export class TreeDataBuilder {
  /**
   * Get the name for a feature
   * @param feature The feature to get the name for
   * @returns The name of the feature
   */
  static nameFor(feature: Feature): string {
    return (feature.properties?.name || feature.id)
  }

  /**
   * Get the ID for a feature
   * @param feature The feature to get the ID for
   * @returns The ID of the feature
   */
  static idFor(feature: Feature): string {
    return `${feature.id || 'unknown'}`
  }

  /**
   * Find children of a specific type
   * @param features The features to search
   * @param dType The data type to filter by
   * @returns An array of FieldDataNode objects
   */
  static findChildrenOfType(features: Feature[], dType: string): FieldDataNode[] {
    const items = features.filter(
      (feature) => feature.properties?.dataType === dType
    )
    return items.map((item) => ({
      title: this.nameFor(item),
      key: this.idFor(item),
      children: [],
    }))
  }

  /**
   * Get the label for an add icon
   * @param key The node key
   * @param title The node title
   * @returns The label for the add icon
   */
  // Map of node types to their add icon labels
  private static readonly nodeLabels = [
    {
      key: NODE_TRACKS,
      getLabel: (title: string) => {
        // special case - get the name for the env
        const env = title as EnvOptions
        return `Create new ${symbolOptions.find(e => e.value === env)?.label} track`
      }
    },
    { key: NODE_FIELDS, getLabel: () => 'Create new buoy field' },
    { key: NODE_ZONES, getLabel: () => 'Create new zone' },
    { key: NODE_POINTS, getLabel: () => 'Create new reference point' },
    { key: NODE_BACKDROPS, getLabel: () => 'Create new backdrop' }
  ]

  static addIconLabelFor(key: string, title: string): string {
    const nodeType = this.nodeLabels.find(node => node.key === key)
    return nodeType ? nodeType.getLabel(title) : `ERROR - node type not handled: ${key}`
  }

  /**
   * Get the icon for a node
   * @param feature The feature (if any)
   * @param key The node key
   * @param title The node title
   * @param handleAdd The add handler function
   * @returns The icon React node
   */
  static getIcon(
    feature: Feature | undefined, 
    key: string, 
    title: string,
    handleAdd?: HandleAddFunction,
    button?: React.ReactNode
  ): React.ReactNode {
    // If no feature is provided, this is a parent node - show plus icon
    if (!feature) {
      if (!handleAdd) return null
      if (button) return button
      return (
        <Tooltip title={this.addIconLabelFor(key, title)}>
          <PlusCircleOutlined
            className="add-icon"
            style={{ cursor: 'copy' }}
            onClick={(e: React.MouseEvent) => handleAdd(e, key, title)}
          />
        </Tooltip>
      )
    }

    // For leaf nodes, show type-specific icon based on dataType
    const dataType = feature.properties?.dataType
    const color = feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color']
    const environment = feature.properties?.env
    return dataType ? <FeatureIcon dataType={dataType} color={color} environment={environment} /> : <FolderOutlined />
  }

  /**
   * Build a track node
   * @param features The features to include
   * @param handleAdd The add handler function
   * @returns A TreeDataNode for tracks
   */
  static buildTrackNode(features: Feature[], handleAdd: HandleAddFunction, useTimeFilter: boolean): TreeDataNode {
    // generate new root
    const root: TreeDataNode = {
      title: 'Units',
      key: NODE_TRACKS,
      icon: <FolderOutlined />,
      children: [],
    }
    const environments = symbolOptions.map((env): TreeDataNode => ({
      title: env.label,
      key: env.value,
      icon: this.getIcon(undefined, NODE_TRACKS, env.value, handleAdd),
      children: features
        .filter(feature => feature.properties?.env === env.value)
        .map((feature): TreeDataNode => ({
          title: this.nameFor(feature),
          key: this.idFor(feature),
          icon: this.getIcon(feature, this.idFor(feature), this.nameFor(feature), handleAdd),
          children: [],
        }))
    }))

    // if time filter is applied, only include environments that contain features
    const validEnvironments = useTimeFilter ? environments.filter(env => !!env.children?.length) : environments

    root.children = root.children ? root.children.concat(...validEnvironments) : [...validEnvironments]
    return root
  }

  /**
   * Build a node for a specific feature type
   * @param features The features to include
   * @param title The node title
   * @param key The node key
   * @param dType The data type to filter by
   * @param handleAdd The add handler function
   * @returns A TreeDataNode for the specified type
   */
  static buildTypeNode(
    features: Feature[],
    title: string,
    key: string,
    dType: FeatureTypes,
    handleAdd: HandleAddFunction,
    useTimeFilter: boolean
  ): TreeDataNode | null {
    const children = features
      ? this.findChildrenOfType(features, dType).map(child => {
        // Find the corresponding feature for this child
        const feature = features.find(f => this.idFor(f) === child.key)
        return {
          ...child,
          icon: this.getIcon(feature, child.key, child.title, handleAdd),
        }
      })
      : []

    if (useTimeFilter && !children.length) return null

    return {
      title: (
        <span>
          {title}
        </span>
      ),
      key,
      icon: this.getIcon(undefined, key, title, handleAdd), // Parent node gets plus icon
      children,
    }
  }

  /**
   * Build the complete tree data model
   * @param features The features to include
   * @param handleAdd The add handler function
   * @param useTimeFilter Whether to filter features by time
   * @param timeStart The start time for filtering (if useTimeFilter is true)
   * @param timeEnd The end time for filtering (if useTimeFilter is true)
   * @returns An array of TreeDataNode objects representing the complete tree
   */
  static buildTreeModel(
    features: Feature[], 
    handleAdd: HandleAddFunction, 
    useTimeFilter: boolean = false, 
    timeStart: number = 0, 
    timeEnd: number = 0
  ): Array<TreeDataNode | null> {
    // If time filtering is enabled, filter the features
    let filteredFeatures = features
    if (useTimeFilter && timeStart !== 0 && timeEnd !== 0) {
      // Filter features based on time properties
      filteredFeatures = features.filter(feature => 
        // Include features that don't have time properties or are visible in the current time period
        !feature.properties?.time || featureIsVisibleInPeriod(feature, timeStart, timeEnd)
      )
    }

    return [
      this.buildTrackNode(filteredFeatures, handleAdd, useTimeFilter),
      this.buildTypeNode(filteredFeatures, 'Buoy Fields', NODE_FIELDS, BUOY_FIELD_TYPE, handleAdd, useTimeFilter),
      this.buildTypeNode(filteredFeatures, 'Zones', NODE_ZONES, ZONE_TYPE, handleAdd, useTimeFilter),
      this.buildTypeNode(filteredFeatures, 'Reference Points', NODE_POINTS, REFERENCE_POINT_TYPE, handleAdd, useTimeFilter),
      this.buildTypeNode(filteredFeatures, 'Backdrops', NODE_BACKDROPS, BACKDROP_TYPE, handleAdd, useTimeFilter),
    ]
  }

  /**
   * Check if an ID is a real feature ID (not a node ID)
   * @param id The ID to check
   * @returns True if the ID is a real feature ID
   */
  static isRealId(id: string): boolean {
    return !id.startsWith('node-')
  }
}
