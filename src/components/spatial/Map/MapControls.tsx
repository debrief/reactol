import React, { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import ScaleNautic from 'react-leaflet-nauticsale'
import { useDocContext } from '../../../state/DocContext'
import { Graticule } from '../AutoGraticule'
import { HomeControl } from '../../HomeControl'
import MouseCoordinates from '../MouseCoordinates'
import { PolylineMeasure } from '../PolylineMeasure'
import { EditFeature } from '../EditFeature'
import TimePeriod from '../TimePeriod'
import { formatCoordinate, formatNatoCoords } from '../../../helpers/formatCoordinate'

export const MapControls: React.FC = () => {
  const map = useMap()
  const { setMapNode, viewportFrozen, useNatoCoords } = useDocContext()

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
  },[map, viewportFrozen, setMapNode])

  const gridFormatter = useMemo(() => {
    return (value: number, isLat: boolean): string => {
      return useNatoCoords ? formatNatoCoords(value, isLat, true, '&nbsp;') : formatCoordinate(value, isLat, true, '&nbsp;')
    }
  }, [useNatoCoords])

  return (
    <>
      <MouseCoordinates/>
      <ScaleNautic nautic={true} metric={false} imperial={false} />
      <Graticule formatter={gridFormatter}/>
      <PolylineMeasure/>
      <HomeControl/>
      <TimePeriod/>
      <EditFeature/>
    </>
  )
}
