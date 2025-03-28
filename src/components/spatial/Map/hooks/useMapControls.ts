import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { useDocContext } from '../../../../state/DocContext'
import { formatCoordinate, formatNatoCoords } from '../../../../helpers/formatCoordinate'

export const useMapControls = () => {
  const map = useMap()
  const { setMapNode, viewportFrozen, useNatoCoords } = useDocContext()

  // Handle map controls based on viewport frozen state
  useEffect(() => {
    if (map) {
      setMapNode(map.getContainer())
      if (viewportFrozen) {
        map.dragging.disable()
        map.scrollWheelZoom.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.boxZoom.disable() 
      } else {
        map.dragging.enable()
        map.scrollWheelZoom.enable()
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.boxZoom.enable()  
      }
    }
  }, [map, viewportFrozen, setMapNode])

  // Create grid formatter based on coordinate format preference
  const gridFormatter = useMemo(() => {
    return (value: number, isLat: boolean): string => {
      return useNatoCoords 
        ? formatNatoCoords(value, isLat, true, '&nbsp;') 
        : formatCoordinate(value, isLat, true, '&nbsp;')
    }
  }, [useNatoCoords])

  return {
    gridFormatter
  }
}
