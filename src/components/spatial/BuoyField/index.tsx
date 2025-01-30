import { Feature, Position } from 'geojson'
import { LeafletMouseEvent } from 'leaflet'
import { CircleMarker, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { useAppContext } from '../../../state/AppContext'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'
import { MultiPoint } from 'geojson'
import { BuoyFieldProps } from '../../../types'

export interface BuoyFieldTypeProps {
  feature: Feature<MultiPoint, BuoyFieldProps> 
  onClickHandler: {(id: string, modifier: boolean): void}
}

export const BuoyField: React.FC<BuoyFieldTypeProps> = ({feature, onClickHandler}) => {
  const { selection, time } = useAppContext()
  const { start: timeStart, end: timeEnd, filterApplied } = time
  const isSelected = selection.includes(feature.id as string)
  
  const locations: [number, number][] | null = useMemo(() => {
    if (feature.geometry.coordinates.length === 0) return null
    const coords = feature.geometry.coordinates as Position[]
    const swapped: [number, number][] = coords.map((coord: Position) => [coord[1], coord[0]])
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
      { isVisible && isSelected && locations &&  locations.length > 0 && locations.map((location: [number, number], index: number) => <CircleMarker key={'shiny-' + index + '-' + color} radius={8} 
        fillColor={'#fff'} color={'#fff'} fill={true} fillOpacity={0} center={location} />)}
      { isVisible && locations && locations.length > 0 && locations.map((location: [number, number], index: number) => <CircleMarker key={'point-' + index + '-' + color} radius={circleRadius} 
        fillColor={color} color={color} fill={true} fillOpacity={1} center={location} eventHandlers={eventHandlers}>
        { index === 0 && <Tooltip className='point-label' key={index + '-tip-'} offset={[0, -20]} direction='center' opacity={1} permanent>
          {name}
        </Tooltip>}
      </CircleMarker>)}
    </>
  )
}
