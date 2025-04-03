import React, { useEffect, useRef } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useDispatch } from 'react-redux'
import { LatLngBounds } from 'leaflet'
import { useAppSelector } from '../../../state/hooks'
import { useDocContext } from '../../../state/DocContext'
import { ViewportChangeType } from '../../../state/geoFeaturesSlice'

export const ViewportTracker: React.FC = () => {
  const map = useMap()
  const dispatch = useDispatch()
  const currentViewport = useAppSelector(state => state.fColl.present.viewport)
  const { preview } = useDocContext()
  const viewport = preview?.viewport || currentViewport

  const lastZoom = useRef(map.getZoom())
  const isInitialLoad = useRef(true)

  // Track map viewport changes and update Redux
  useMapEvents({
    moveend: () => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        return
      }

      const bounds = map.getBounds()
      const currentZoom = map.getZoom()
      
      // Determine the type of viewport change
      let changeType: ViewportChangeType = 'pan'
      if (currentZoom !== lastZoom.current) {
        changeType = currentZoom > lastZoom.current ? 'zoom_in' : 'zoom_out'
        lastZoom.current = currentZoom
      }

      const newViewport = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: currentZoom,
        changeType
      }

      // we need to compare viewport with newViewport, but we should ignore the `changeType` property
      const viewportWithoutChangeType = { ...viewport, changeType: undefined }
      const newViewportWithoutChangeType = { ...newViewport, changeType: undefined }

      // Only dispatch if viewport actually changed
      if (JSON.stringify(newViewportWithoutChangeType) !== JSON.stringify(viewportWithoutChangeType)) {
        dispatch({
          type: 'fColl/setViewport',
          payload: newViewport
        })
      }
    }
  })

  // Update map when viewport changes in Redux
  useEffect(() => {
    if (viewport && map) {
      const bounds = new LatLngBounds(
        [viewport.south, viewport.west],
        [viewport.north, viewport.east]
      )
      
      // Use animation for user-initiated changes, but not for undo/redo
      const animate = viewport.changeType !== 'restore'
      map.fitBounds(bounds, { animate })
      map.setZoom(viewport.zoom, { animate })
      
      // Update lastZoom to prevent triggering another change
      lastZoom.current = viewport.zoom
    }
  }, [viewport, map])

  return null
}
