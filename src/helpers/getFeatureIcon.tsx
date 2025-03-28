import React from 'react'
import { TrackIcon, BuoyFieldIcon, ZoneIcon, PointIcon } from '../components/Layers/NodeIcons'
import { TRACK_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE } from '../constants'

interface GetFeatureIconProps {
  dataType: string
  color?: string
  environment?: string
}

export const getFeatureIcon = ({ dataType, color, environment }: GetFeatureIconProps): React.ReactNode => {
  console.log('geting icon for', dataType, color, environment)
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
