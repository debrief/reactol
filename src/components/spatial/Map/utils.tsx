import React from 'react'
import { Feature, MultiPoint, Point, Polygon } from 'geojson'
import { BACKDROP_TYPE, BUOY_FIELD_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../../constants'
import Track from '../Track'
import Zone from '../Zone'
import { Point as DataPoint } from '../Point'
import { BuoyField } from '../BuoyField'
import { ATileLayer } from '../ATileLayer'
import { BackdropProps, BuoyFieldProps } from '../../../types'

export const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

export const featureFor = (feature: Feature, onClickHandler: (id: string, modifier: boolean) => void): React.ReactElement | null => {
  switch(feature.properties?.dataType) {
  case TRACK_TYPE:
    return <Track key={feature.id as string} feature={feature} onClickHandler={onClickHandler} /> 
  case ZONE_TYPE:
    return <Zone key={feature.id as string} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
  case REFERENCE_POINT_TYPE:
    return <DataPoint key={feature.id as string} feature={feature as Feature<Point>} onClickHandler={onClickHandler} /> 
  case BUOY_FIELD_TYPE:
    return <BuoyField key={feature.id as string} feature={feature as Feature<MultiPoint, BuoyFieldProps>} onClickHandler={onClickHandler} />
  case BACKDROP_TYPE:
    return <ATileLayer key={feature.id as string} feature={feature as Feature<MultiPoint, BackdropProps>} />
  default:
    console.log('Unknown feature type:',feature)
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}
