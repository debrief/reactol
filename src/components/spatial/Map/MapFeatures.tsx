import React, { useCallback, useMemo } from 'react'
import { Feature, MultiPoint, Point, Polygon } from 'geojson'
import { TRACK_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE, BUOY_FIELD_TYPE, BACKDROP_TYPE } from '../../../constants'
import { BuoyFieldProps, BackdropProps } from '../../../types'
import { ATileLayer } from '../ATileLayer'
import { BuoyField } from '../BuoyField'
import Track from '../Track'
import Zone from '../Zone'
import { Point as DataPoint } from '../Point'
import { useAppSelector } from '../../../state/hooks'
import { useDocContext } from '../../../state/DocContext'
import { selectFeatures } from '../../../state/geoFeaturesSlice'

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

export const MapFeatures: React.FC = () => {
  const features = useAppSelector(selectFeatures)
  const { selection, setSelection, preview } = useDocContext()
  const relevantFeatures = preview ? preview.data.features : features

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selection.includes(id)) {
        setSelection(selection.filter((selectedId) => selectedId !== id))
      } else {
        setSelection([...selection, id])
      }
    } else {
      // just select this item
      setSelection([id])
    }
  }, [selection, setSelection])

  const visibleFeatures = useMemo(() => {
    const vis = relevantFeatures.filter(feature => isVisible(feature))
    const asElements = vis.map((feature: Feature): React.ReactElement | null => {
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
    })
    return asElements.filter(Boolean)
  }, [relevantFeatures, onClickHandler])

  return <>{visibleFeatures}</>
}
