import { Feature, Geometry, LineString } from 'geojson'
import { LeafletMouseEvent } from 'leaflet'
import { Polyline, CircleMarker, Tooltip, Marker } from 'react-leaflet'
import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'
import { CoordInstance, filterTrack } from '../../../helpers/filterTrack'
import { TrackProps } from '../../../types'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'
import { divIcon } from 'leaflet'

const ENVIRONMENT_ICON_SCALE = 2.5 // Scaling factor for environment icons
const BASE_ICON_SIZE = 16 // Base size of the SVG viewBox

export interface TrackFeatureProps {
  feature: Feature
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

const Track: React.FC<TrackFeatureProps> = ({ feature, onClickHandler }) => {
  const { selection, time } = useDocContext()
  const isSelected = selection.includes(feature.id as string)

  const trackCoords: CoordInstance[] = useMemo(() => {
    const coords = (feature.geometry as LineString).coordinates
    const props = feature.properties as TrackProps
    if (time && props?.times) {
      const times = props?.times
      const validCoords = filterTrack(
        time.filterApplied,
        time.start,
        time.end,
        times,
        coords,
        props.labelInterval,
        props.symbolInterval
      )
      // sanity check, that we don't have too many labels
      const numLabels = validCoords.filter((item) => item.labelVisible).length
      if (numLabels > 20) {
        const freq = Math.floor(numLabels / 20)
        validCoords.forEach((item, index) => {
          item.labelVisible = index % freq === 0
        })
      }
      return validCoords
    }
    return []
  }, [feature, time])

  const currentLocation = useMemo(() => {
    return trackCoords.length > 0 ? trackCoords[trackCoords.length - 1] : null
  }, [trackCoords])

  const currentTime = useMemo(() => {
    if (trackCoords.length === 0) return null
    const time = trackCoords[trackCoords.length - 1].time
    return time
  }, [trackCoords])

  const color = colorFor(feature)

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(
      feature.id as string,
      evt.originalEvent.altKey || evt.originalEvent.ctrlKey
    )
  }

  const lineWeight = 2

  const circleRadius = 3

  /** in order for cosmetic changes to be reflected in the UI, we need to include styling
   * properties in the `key` for each leaflet element
   */
  const itemId = useMemo(() => {
    return feature.id + '-' + isSelected + '' + colorFor(feature)
  }, [feature, isSelected])

  const eventHandlers = {
    click: onclick,
    mouseover: mouseOver,
    mouseout: (evt: LeafletMouseEvent) => mouseOut(evt, isSelected),
  }

  return (
    <>
      { isSelected && <Polyline
        key={'-shiny-' + itemId}
        positions={trackCoords.map((val: CoordInstance) => val.pos)}
        weight={4}
        color={'#fff'}
      /> }
      <Polyline
        key={'-line-' + itemId}
        eventHandlers={eventHandlers}
        positions={trackCoords.map((val: CoordInstance) => val.pos)}
        weight={lineWeight}
        color={color}
      />
      {isSelected &&trackCoords
        .filter((item) => item.symbolVisible)
        .map((item: CoordInstance, index: number) => (
          <CircleMarker
            fillColor={'#fff'}
            fill={true}
            color={'#fff'}
            fillOpacity={1}
            weight={4}
            key={'-shiny-' + itemId + '-' + index}
            center={item.pos}
            radius={item.symbolVisible ? circleRadius : 0} />
        ))}
      {trackCoords
        .filter((item) => item.labelVisible || item.symbolVisible)
        .map((item: CoordInstance, index: number) => (
          <CircleMarker
            fillColor={color}
            fill={isSelected}
            color={color}
            fillOpacity={1}
            weight={lineWeight}
            key={'-point-' + itemId + '-' + index}
            center={item.pos}
            radius={item.symbolVisible ? circleRadius : 0}
            eventHandlers={eventHandlers}>
            { item.labelVisible && (
              <Tooltip
                className='time-marker'
                key={itemId + '-tip-' + index}
                offset={[0, -20]}
                direction='center'
                opacity={1}
                permanent
              >
                {item.time}
              </Tooltip>
            )}
          </CircleMarker>
        ))}
      {currentLocation && (
        <Marker
          position={currentLocation.pos}
          icon={divIcon({
            className: 'environment-icon-marker',
            html: (() => {
              const env = (feature.properties as TrackProps).env
              const size = BASE_ICON_SIZE * ENVIRONMENT_ICON_SCALE
              const color = (feature.properties as TrackProps).color
              const svgContent = (() => {
                switch (env) {
                case 'air':
                  return `<path d="M4 9C4 6.79086 5.79086 5 8 5C10.2091 5 12 6.79086 12 9" stroke="${color}" stroke-width="1.5" fill="none"/>
                    <circle cx="8" cy="10" r="1" fill="${color}"/>`
                case 'nav':
                  return `<circle cx="8" cy="8" r="4" stroke="${color}" stroke-width="1.5" fill="none"/>
                    <circle cx="8" cy="8" r="1" fill="${color}"/>`
                case 'sub':
                  return `<path d="M4 7C4 9.20914 5.79086 11 8 11C10.2091 11 12 9.20914 12 7" stroke="${color}" stroke-width="1.5" fill="none"/>
                    <circle cx="8" cy="6" r="1" fill="${color}"/>`
                case 'lnd':
                  return `<path d="M4 12L8 5L12 12H4Z" stroke="${color}" stroke-width="1.5" fill="none"/>`
                default:
                  return `<circle cx="8" cy="8" r="4" stroke="${color}" stroke-width="1.5" fill="none"/>`
                }
              })()
              return `<div style="width: ${size}px; height: ${size}px;">
                <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  ${svgContent}
                </svg>
              </div>`
            })(),
            iconSize: [BASE_ICON_SIZE * ENVIRONMENT_ICON_SCALE, BASE_ICON_SIZE * ENVIRONMENT_ICON_SCALE],
            iconAnchor: [BASE_ICON_SIZE * ENVIRONMENT_ICON_SCALE / 2, BASE_ICON_SIZE * ENVIRONMENT_ICON_SCALE / 2]
          })}
        >
          <Tooltip
            className={'track-name'}
            key={feature.id + '-track-name-' + isSelected}
            direction='bottom'
            opacity={1}
            permanent>
            {feature.properties?.shortName}<br/>
            {currentTime}
          </Tooltip>

        </Marker>
      )}
    </>
  )
}

export default Track
