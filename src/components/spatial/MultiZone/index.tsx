import * as turf from '@turf/turf'
import { Feature, MultiPolygon, Position } from 'geojson'
import { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import { Polygon as ReactPolygon, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'

export interface MultiZoneProps {
  feature: Feature<MultiPolygon>
  onClickHandler: { (id: string, modifier: boolean): void }
}

const MultiZone: React.FC<MultiZoneProps> = ({ feature, onClickHandler }) => {
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

  const polygons = useMemo((): React.ReactElement[] => {
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
    const polys = feature.geometry.coordinates
    return polys.map((poly, index) => {
      const points = turf.featureCollection([
        turf.polygon(poly),
      ])
      const centre = turf
        .center(points)
        .geometry.coordinates.reverse() as LatLngExpression

      const trackCoords =  (poly as unknown as Position[][]).map((line) => line.map((item): LatLngExpression => [item[1], item[0]])) 
      return <ReactPolygon
        key={feature.id + '-polygon-' + isSelected + lineWeight + color + fill + index}
        fill={true}
        positions={trackCoords}
        interactive={false}
        weight={lineWeight}
        color={color}
        fillOpacity={opacity}
        eventHandlers={eventHandlers}
      >
        <Tooltip
          className={'zone-label'}
          position={centre}
          direction='center'
          opacity={1}
          permanent
        >
          {feature.properties?.names[index]}
        </Tooltip>
      </ReactPolygon>
    })
  }, [feature, isSelected, lineWeight, color, fill, opacity, onClickHandler])


  //   if (coords.length === 0 || coords[0].length === 0) return null
  //   const points = turf.featureCollection([
  //     turf.polygon((feature.geometry as MultiPolygon).coordinates),
  //   ])
  //   const centre = turf
  //     .center(points)
  //     .geometry.coordinates.reverse() as LatLngExpression
  //   const polyCoords = (feature.geometry as MultiPolygon).coordinates
  //   // our coordinates may be a single line (polygon, circle) or multiple lines (shape with a hole).
  //   const trackCoords =  (polyCoords as unknown as Position[][]).map((line) => line.map((item): LatLngExpression => [item[1], item[0]])) 
  //   return (
  //     <>
  //       <ReactPolygon
  //         key={feature.id + '-polygon-' + isSelected + lineWeight + color + fill}
  //         fill={true}
  //         positions={trackCoords}
  //         interactive={false}
  //         weight={lineWeight}
  //         color={color}
  //         fillColor={fill}
  //         eventHandlers={eventHandlers}
  //         fillOpacity={ isSelected ? 0.65 : opacity}
  //       >
  //         <Tooltip
  //           className={'zone-label'}
  //           position={centre}
  //           direction='center'
  //           opacity={1}
  //           permanent
  //         >
  //           {feature.properties?.name}
  //         </Tooltip>
  //       </ReactPolygon>
  //       {/* we only allow clicking on the edge, by preventing the polygon from being clicked,
  //         but allowing this polyline to be clicked */}
  //       <Polyline
  //         key={feature.id + '-edge-' + isSelected}
  //         positions={trackCoords}
  //         interactive={true}
  //         weight={lineWeight}
  //         color={color}
  //         eventHandlers={eventHandlers}
  //       >
  //       </Polyline>
  //     </>
  //   )
  // }, [feature, isSelected, lineWeight, onClickHandler, opacity, color, fill])

  return <>{isVisible && polygons}</>
}

export default MultiZone
