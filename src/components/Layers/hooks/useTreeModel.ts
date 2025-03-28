import { useCallback, useEffect, useMemo, useState } from 'react'
import { Feature } from 'geojson'
import { TreeDataNode } from 'antd'
import { EnvOptions } from '../../../types'
import { NODE_TRACKS, NODE_FIELDS, NODE_ZONES, NODE_POINTS, NODE_BACKDROPS } from '../constants'
import { mapFunc, trackFunc } from '../treeUtils.tsx'
import { BACKDROP_TYPE, BUOY_FIELD_TYPE, REFERENCE_POINT_TYPE, ZONE_TYPE } from '../../../constants'

export const useTreeModel = (
  features: Feature[], 
  handleAdd: (e: React.MouseEvent, key: string, title: string) => void,
  _addZone: (key: string) => void, // Prefixed with underscore to indicate it's intentionally unused
  externalPendingEnvironment?: EnvOptions | null
) => {
  const [model, setModel] = useState<TreeDataNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([NODE_TRACKS])
  const [pendingTrackEnvironment, setPendingTrackEnvironment] = useState<EnvOptions | null>(null)
  
  // Sync with external environment state if provided
  useEffect(() => {
    if (externalPendingEnvironment !== undefined && externalPendingEnvironment !== pendingTrackEnvironment) {
      setPendingTrackEnvironment(externalPendingEnvironment)
    }
  }, [externalPendingEnvironment, pendingTrackEnvironment])

  // Check if tree is expanded
  const isExpanded = useMemo(() => expandedKeys.length > 0, [expandedKeys])

  // Handle dialog cancel
  const handleDialogCancel = useCallback(() => {
    setPendingTrackEnvironment(null)
  }, [])

  // Build tree model
  useEffect(() => {
    const items: TreeDataNode[] = []
    items.push(trackFunc(features, handleAdd))
    items.push(
      mapFunc(features, 'Buoy Fields', NODE_FIELDS, BUOY_FIELD_TYPE, handleAdd)
    )
    items.push(mapFunc(features, 'Zones', NODE_ZONES, ZONE_TYPE, handleAdd, 
      null)) // We'll add the AddZoneShape component in the main component
    items.push(
      mapFunc(
        features,
        'Points',
        NODE_POINTS,
        REFERENCE_POINT_TYPE,
        handleAdd
      )
    )

    items.push(mapFunc(features, 'Backdrops', NODE_BACKDROPS, BACKDROP_TYPE, handleAdd))
    setModel(items)
  }, [features, handleAdd])

  return {
    model,
    expandedKeys,
    setExpandedKeys,
    pendingTrackEnvironment,
    setPendingTrackEnvironment,
    isExpanded,
    handleDialogCancel
  }
}
