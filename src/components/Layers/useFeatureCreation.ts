import { useCallback } from 'react'
import { Feature, MultiPoint, Point } from 'geojson'
import {
  BACKDROP_TYPE,
  BUOY_FIELD_TYPE,
  REFERENCE_POINT_TYPE
} from '../../constants'
import { 
  BackdropProps, 
  BuoyFieldProps, 
  PointProps 
} from '../../types'
import { zoneFeatureFor } from '../../helpers/zoneShapePropsFor'

/**
 * Hook that provides methods for creating new features
 * @param setNewFeature Function to set the new feature in the parent component
 * @returns Object containing methods to create different types of features
 */
export const useFeatureCreation = (
  setNewFeature: (feature: Feature) => void,
  setSelection: (selection: string[]) => void
) => {
  /**
   * Helper function to set a new feature and clear selection
   */
  const localSetNewFeature = useCallback((feature: Feature) => {
    setSelection([])
    setNewFeature(feature)
  }, [setNewFeature, setSelection])

  /**
   * Create a new backdrop feature
   */
  const addBackdrop = useCallback(() => {
    const backdrop: Feature<MultiPoint, BackdropProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: BACKDROP_TYPE,
        visible: true,
        url: '',
        maxNativeZoom: 0,
        maxZoom: 0,
      },
      geometry: {
        type: 'MultiPoint',
        coordinates: [],
      },
    }
    localSetNewFeature(backdrop)
  }, [localSetNewFeature])

  /**
   * Create a new reference point feature
   */
  const addPoint = useCallback(() => {
    const point: Feature<Point, PointProps> = {
      type: 'Feature',
      properties: {
        name: '',
        dataType: REFERENCE_POINT_TYPE,
        'marker-color': '#FF0000',
        visible: true,
      },
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    }
    localSetNewFeature(point)
  }, [localSetNewFeature])

  /**
   * Create a new zone feature of the specified type
   */
  const addZone = useCallback((key: string): void => {
    const zone = zoneFeatureFor(key)
    localSetNewFeature(zone)
  }, [localSetNewFeature])

  /**
   * Create a new buoy field feature
   */
  const addBuoyField = useCallback(() => {
    const buoyField: Feature<MultiPoint, BuoyFieldProps> = {
      type: 'Feature',
      properties: {
        name: '',
        shortName: '',
        dataType: BUOY_FIELD_TYPE,
        'marker-color': '#FF0000',
        visible: true,
      },
      geometry: {
        type: 'MultiPoint',
        coordinates: [],
      },
    }
    localSetNewFeature(buoyField)
  }, [localSetNewFeature])

  return {
    addBackdrop,
    addPoint,
    addZone,
    addBuoyField
  }
}
