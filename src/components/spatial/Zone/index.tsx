import * as turf from '@turf/turf'
import { Feature, Polygon, Position } from 'geojson'
import { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import { Polyline, Polygon as ReactPolygon, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'

export interface ZoneProps {
  feature: Feature<Polygon>
  onClickHandler: { (id: string, modifier: boolean): void }
}

const Zone: React.FC<ZoneProps> = ({ feature, onClickHandler }) => {
  const { selection, time } = useDocContext()
  const { start: timeStart, end: timeEnd, filterApplied } = time
  const isSelected = selection.includes(feature.id as string)

  const isVisible = useMemo(() => {
    return filterApplied
      ? featureIsVisibleInPeriod(feature, timeStart, timeEnd)
      : true
  }, [feature, timeStart, timeEnd, filterApplied])

  const color = useMemo(() => {
    return feature.properties?.stroke || '#F0F'
  }, [feature])

  const fill = useMemo(() => {
    return feature.properties?.fill || feature.properties?.stroke || '#F0F'  
  }, [feature])

  const lineWeight = useMemo(() => {
    return feature.properties?.['stroke-width'] || 2
  }, [feature])

  const opacity = useMemo(() => {
    return feature.properties?.['fill-opacity'] || 0.15
  }, [feature])

  const polygon = useMemo(() => {
    const onclick = (evt: LeafletMouseEvent) => {
      onClickHandler(
        feature.id as string,
        evt.originalEvent.altKey || evt.originalEvent.ctrlKey
      )
    }

    const eventHandlers = {
      click: onclick,
      mouseover: mouseOver,
      mouseout: (evt: LeafletMouseEvent) => mouseOut(evt, isSelected),
    }
    const coords = feature.geometry.coordinates
    if (coords.length === 0 || coords[0].length === 0) return null
    const points = turf.featureCollection([
      turf.polygon((feature.geometry as Polygon).coordinates),
    ])
    const centre = turf
      .center(points)
      .geometry.coordinates.reverse() as LatLngExpression
    const polyCoords = (feature.geometry as Polygon).coordinates
    // our coordinates may be a single line (polygon, circle) or multiple lines (shape with a hole).
    const trackCoords =  (polyCoords as unknown as Position[][]).map((line) => line.map((item): LatLngExpression => [item[1], item[0]])) 
    return (
      <>
        {isSelected && (
          <ReactPolygon
            key={feature.id + '-shiny-border-' + isSelected}
            positions={trackCoords}
            interactive={false}
            fill={false}
            weight={6}
            color={'#fff'}
            eventHandlers={eventHandlers}
          ></ReactPolygon>
        )}
        <ReactPolygon
          key={feature.id + '-polygon-' + isSelected + lineWeight + color + fill}
          fill={true}
          positions={trackCoords}
          interactive={false}
          weight={lineWeight}
          color={color}
          fillColor={fill}
          eventHandlers={eventHandlers}
          fillOpacity={ isSelected ? 0.65 : opacity}
        >
          <Tooltip
            className={'zone-label'}
            position={centre}
            direction='center'
            opacity={1}
            permanent
          >
            {feature.properties?.name}
          </Tooltip>
        </ReactPolygon>
        {/* we only allow clicking on the edge, by preventing the polygon from being clicked,
          but allowing this polyline to be clicked */}
        <Polyline
          key={feature.id + '-edge-' + isSelected}
          positions={trackCoords}
          interactive={true}
          weight={lineWeight}
          color={color}
          eventHandlers={eventHandlers}
        >
        </Polyline>
      </>
    )
  }, [feature, isSelected, lineWeight, onClickHandler, opacity, color, fill])

  return <>{isVisible && polygon}</>
}

export default Zone
