import { Feature, Geometry, LineString } from 'geojson'
import { LeafletMouseEvent } from 'leaflet'
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useAppContext } from '../../../state/AppContext'
import { CoordInstance, filterTrack } from '../../../helpers/filterTrack'
import { TrackProps } from '../../../types'
import './index.css'
import { mouseOut, mouseOver } from '../commonHandlers'

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
  const { selection, time } = useAppContext()
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
    } else {
      const times = feature.properties?.times
      const timeFreq = Math.floor(times.length / 20)

      if (times && times.length) {
        return times.map((time: string, index: number) => {
          return {
            pos: [coords[index][1], coords[index][0]],
            time: format(time, 'ddHHmm"Z"'),
            timeVisible: index % timeFreq === 0,
          }
        })
      } else {
        return coords.map((coord: number[]) => {
          return { pos: [coord[1], coord[0]], time: '' }
        })
      }
    }
  }, [feature, time])

  const onclick = (evt: LeafletMouseEvent) => {
    onClickHandler(
      feature.id as string,
      evt.originalEvent.altKey || evt.originalEvent.ctrlKey
    )
  }

  const lineWeight = useMemo(() => {
    return 2 //  isSelected ? 3 : 2
  }, [isSelected])

  const circleRadius = useMemo(() => {
    return 3 // isSelected ? 5 : 3
  }, [isSelected])

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
        color={colorFor(feature)}
      />
      {trackCoords.length && (
        <CircleMarker
          key={'-start-line-' + itemId}
          center={trackCoords[0].pos}
          color={colorFor(feature)}
          radius={circleRadius}
        >
          <Tooltip
            className={'track-name'}
            key={feature.id + '-start-name-' + isSelected}
            direction='left'
            opacity={1}
            permanent
          >
            {feature.properties?.shortName}
          </Tooltip>
        </CircleMarker>
      )}
      {trackCoords
        .filter((item) => item.labelVisible || item.symbolVisible)
        .map((item: CoordInstance, index: number) => (
          <>
            { isSelected &&
              <CircleMarker
                fillColor={'#fff'}
                fill={true}
                color={'#fff'}
                fillOpacity={1}
                weight={4}
                key={'-shiny-' + itemId + '-' + index}
                center={item.pos}
                radius={item.symbolVisible ? circleRadius : 0} />
            }
            <CircleMarker
              fillColor={colorFor(feature)}
              fill={isSelected}
              color={colorFor(feature)}
              fillOpacity={1}
              weight={lineWeight}
              key={'-point-' + itemId + '-' + index}
              center={item.pos}
              radius={item.symbolVisible ? circleRadius : 0}
              eventHandlers={eventHandlers}>
              { item.labelVisible && (
                <Tooltip
                  className='time-marker'
                  key={feature.id + '-tip-' + index}
                  offset={[0, -20]}
                  direction='center'
                  opacity={1}
                  permanent
                >
                  {item.time}
                </Tooltip>
              )}
            </CircleMarker>
          </>

        ))}
    </>
  )
}

export default Track
