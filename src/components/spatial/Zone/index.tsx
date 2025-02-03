import * as turf from '@turf/turf'
import { Feature, Geometry, Polygon } from 'geojson'
import { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import { Polyline as ReactPolygon, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { featureIsVisibleInPeriod } from '../../../helpers/featureIsVisibleAtTime'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'

export interface ZoneProps {
  feature: Feature<Polygon>
  onClickHandler: { (id: string, modifier: boolean): void }
}

const colorFor = (feature: Feature<Geometry, unknown> | undefined): string => {
  if (feature) {
    const feat = feature as Feature
    if (feat.properties) {
      return feat.properties.color || '#ff0'
    }
  }
  return '#000'
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

  const lineWeight = 2 

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
    const trackCoords = (feature.geometry as Polygon).coordinates[0].map(
      (item) => [item[1], item[0]]
    ) as LatLngExpression[]
    return (
      <>
        {isSelected && (
          <ReactPolygon
            key={feature.id + '-shiny-border-' + isSelected}
            positions={trackCoords}
            weight={6}
            opacity={0.7}
            color={'#fff'}
            eventHandlers={eventHandlers}
          ></ReactPolygon>
        )}
        <ReactPolygon
          key={feature.id + '-line-' + isSelected}
          fill={true}
          positions={trackCoords}
          weight={lineWeight}
          color={colorFor(feature)}
          eventHandlers={eventHandlers}
          fillOpacity={ isSelected ? 0.15 : 0.1}
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
      </>
    )
  }, [feature, isSelected, lineWeight, onClickHandler])

  return <>{isVisible && polygon}</>
}

export default Zone
