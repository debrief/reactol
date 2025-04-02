import { useState, useCallback } from 'react'
import { useAppDispatch } from '../../state/hooks'
import { EnvOptions, NewTrackProps, TrackProps } from '../../types'
import { TRACK_TYPE } from '../../constants'

/**
 * Hook to manage track-related operations in the Layers component
 */
export const useTrackManagement = () => {
  const dispatch = useAppDispatch()
  const [pendingTrack, setPendingTrack] = useState<EnvOptions | null>(null)

  const handleDialogCancel = useCallback(() => {
    setPendingTrack(null)
  }, [])

  const setLoadTrackResults = useCallback(async (values: NewTrackProps) => {
    setPendingTrack(null)
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

  return {
    pendingTrack,
    setPendingTrack,
    handleDialogCancel,
    setLoadTrackResults
  }
}
