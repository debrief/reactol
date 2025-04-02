import { useCallback } from 'react'
import { useAppDispatch } from '../../state/hooks'
import { NewTrackProps, TrackProps } from '../../types'
import { TRACK_TYPE } from '../../constants'

/**
 * Hook to handle track creation logic
 */
export const useTrackCreation = () => {
  const dispatch = useAppDispatch()

  const createTrack = useCallback((values: NewTrackProps) => {
    // Convert props from NewTrackProps format to TrackProps format
    const newValues = values as unknown as TrackProps
    newValues.labelInterval = parseInt(values.labelInterval)
    newValues.symbolInterval = parseInt(values.symbolInterval)
    
    // Create the new track feature
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
    
    // Dispatch the action to add the feature
    dispatch({
      type: 'fColl/featureAdded',
      payload: newTrack,
    })
  }, [dispatch])

  return {
    createTrack
  }
}
