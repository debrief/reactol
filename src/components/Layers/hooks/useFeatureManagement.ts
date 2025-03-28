import { useCallback } from 'react'
import { Feature, MultiPoint, Point } from 'geojson'
import { useAppDispatch } from '../../../state/hooks'
import { useDocContext } from '../../../state/DocContext'
import { 
  BACKDROP_TYPE, 
  BUOY_FIELD_TYPE, 
  REFERENCE_POINT_TYPE,
  TRACK_TYPE
} from '../../../constants'
import { zoneFeatureFor } from '../../../helpers/zoneShapePropsFor'
import { BackdropProps, BuoyFieldProps, NewTrackProps, PointProps, TrackProps } from '../../../types'

export const useFeatureManagement = () => {
  const dispatch = useAppDispatch()
  const { setSelection, setNewFeature } = useDocContext()
  
  // Helper function to set a new feature and clear selection
  const localSetNewFeature = useCallback((feature: Feature) => {
    setSelection([])
    setNewFeature(feature)
  }, [setNewFeature, setSelection])

  // Add a new backdrop
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

  // Add a new reference point
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

  // Add a new zone
  const addZone = useCallback((key: string): void => {
    const zone = zoneFeatureFor(key)
    localSetNewFeature(zone)
  }, [localSetNewFeature])

  // Add a new buoy field
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

  // Process track creation results
  const setLoadTrackResults = useCallback((values: NewTrackProps) => {
    // props in NewTrackProps format to TrackProps format, where they have different type
    const newValues = values as unknown as TrackProps
    newValues.labelInterval = parseInt(values.labelInterval)
    newValues.symbolInterval = parseInt(values.symbolInterval)
    const newTrack = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
      properties: {
        ...newValues,
        dataType: TRACK_TYPE,
        times: [],
        courses: [],
        speeds: [],
      },
    }
    dispatch({
      type: 'fColl/featureAdded',
      payload: newTrack,
    })
  }, [dispatch])

  // Delete selected features
  const deleteFeatures = useCallback((ids: string[]) => {
    dispatch({
      type: 'fColl/featuresDeleted',
      payload: { ids },
    })
    setSelection([])
  }, [dispatch, setSelection])

  return {
    addBackdrop,
    addPoint,
    addZone,
    addBuoyField,
    setLoadTrackResults,
    deleteFeatures,
    localSetNewFeature
  }
}
