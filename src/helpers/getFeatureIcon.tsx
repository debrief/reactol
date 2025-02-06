import React from 'react'
import { TrackIcon, BuoyFieldIcon, ZoneIcon, PointIcon, GroupIcon } from '../components/Layers/NodeIcons'
import { TRACK_TYPE, BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE, GROUP_TYPE } from '../constants'

interface GetFeatureIconProps {
  dataType: string
  color?: string
}

export const getFeatureIcon = ({ dataType, color }: GetFeatureIconProps): React.ReactNode => {
  switch (dataType) {
  case TRACK_TYPE:
    return <TrackIcon color={color} />
  case BUOY_FIELD_TYPE:
    return <BuoyFieldIcon color={color} />
  case ZONE_TYPE:
    return <ZoneIcon color={color} />
  case REFERENCE_POINT_TYPE:
    return <PointIcon color={color} />
  case GROUP_TYPE:
    return <GroupIcon color={color} />
  default:
    return null
  }
}
