import { Feature, Position, Point as GPoint } from 'geojson'
import { LeafletMouseEvent } from 'leaflet'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'

export interface PointSymbolProps {
  feature: Feature<GPoint> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

export const Point: React.FC<PointSymbolProps> = ({feature, onClickHandler}) => {
  const { selection, time } = useDocContext()
  const { start: timeStart, end: timeEnd, filterApplied } = time
  const isSelected = selection.includes(feature.id as string)
  
  const location: [number, number] | null = useMemo(() => {
    if (feature.geometry.coordinates.length === 0) return null
    const coords = feature.geometry.coordinates as Position
    const swapped: [number, number] = [coords[1], coords[0]]
    return swapped
  }, [feature])

  const color = useMemo(() => {
    return feature.properties?.color || 'blue'
  }, [feature])

  const isVisible = useMemo(() => {
    return filterApplied ? featureIsVisibleInPeriod(feature, timeStart, timeEnd) : true
  }, [feature, timeStart, timeEnd, filterApplied])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(feature.id as string, evt.originalEvent.altKey || evt.originalEvent.ctrlKey)
  }

  const name = feature.properties?.name || ''

  const circleRadius = 4

  const eventHandlers = {
    click: onclick,
    mouseover: mouseOver,
    mouseout: (evt: LeafletMouseEvent) => mouseOut(evt, isSelected),
  }

  return (
    <>
      { isVisible && location && isSelected && <CircleMarker key={'shiny-' + feature.id + '-' + color} radius={8} 
        fillColor={'#fff'} color={'#fff'} fill={true} fillOpacity={0} center={location} />}
      { isVisible && location && <CircleMarker key={'point-' + feature.id + '-' + color} radius={circleRadius} 
        fillColor={color} color={color} fill={true} fillOpacity={1} center={location} eventHandlers={eventHandlers}>
        <Tooltip className='point-label' key={feature.id + '-tip-'} offset={[0, -20]} direction='center' opacity={1} permanent>
          {name}
        </Tooltip>
      </CircleMarker>}
    </>
  )
}
