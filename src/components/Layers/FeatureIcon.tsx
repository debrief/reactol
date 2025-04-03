import React from 'react'
import { TrackIcon, BuoyFieldIcon, ZoneIcon, PointIcon } from './NodeIcons'
import { TRACK_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE } from '../../constants'

interface FeatureIconProps {
  dataType?: string
  color?: string
  environment?: string
}

/**
 * Component that renders the appropriate icon for a feature based on its type
 */
export const FeatureIcon: React.FC<FeatureIconProps> = ({ 
  dataType, 
  color, 
  environment 
}) => {
  if (!dataType) return null

  switch (dataType) {
  case TRACK_TYPE:
    return <TrackIcon color={color} environment={environment} />
  case BUOY_FIELD_TYPE:
    return <BuoyFieldIcon color={color} />
  case ZONE_TYPE:
    return <ZoneIcon color={color} />
  case REFERENCE_POINT_TYPE:
    return <PointIcon color={color} />
  default:
    return null
  }
}
