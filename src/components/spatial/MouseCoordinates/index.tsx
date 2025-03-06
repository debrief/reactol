import { LeafletMouseEvent } from 'leaflet'
import React, { useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { Feature, FeatureCollection, LineString, MultiPoint, Point, Polygon } from 'geojson'
import * as turf from '@turf/turf'
import nearestPoint from '@turf/nearest-point'
import './index.css'
import { useDocContext } from '../../../state/DocContext'
import { useAppSelector } from '../../../state/hooks'
import { formatCoordinate, formatNatoCoords } from '../../../helpers/formatCoordinate'
import { Switch } from 'antd'

const bearingToAzimuth = (bearing: number) => {
  return (bearing + 360) % 360
}

const featureToPoints = (feature: Feature): FeatureCollection<Point> => {
  switch (feature.geometry.type) {
  case 'Point':
    return turf.featureCollection([feature as Feature<Point>])
  case 'LineString':
    return turf.explode(feature as Feature<LineString>)
  case 'MultiPoint':
    return turf.explode(feature as Feature<MultiPoint>)
  case 'Polygon':
    return turf.explode(feature as Feature<Polygon>)
  default:
    return turf.featureCollection([])
  }
}

const hasEmptyCoordinates = (feature: Feature): boolean => {
  switch (feature.geometry.type) {
  case 'Point':
    return feature.geometry.coordinates.length === 0
  case 'LineString':
    return feature.geometry.coordinates.length === 0
  case 'MultiPoint':
    return feature.geometry.coordinates.length === 0
  case 'Polygon':
    return feature.geometry.coordinates.length === 0
  default:
    return true
  }
}

const MouseCoordinates: React.FC = () => {
  const { selection, useNatoCoords, setUseNatoCoords } = useDocContext()
  const features = useAppSelector(state => state.fColl.features)
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number }>({lat:0, lng:0})
  const { viewportFrozen } = useDocContext()

  const map = useMap()

  useMapEvents({
    mousemove: (event: LeafletMouseEvent) => {
      const { lat, lng } = event.latlng
      setMouseCoords({ lat, lng })
    }
  })

  const rangeBearing: {rng: number, brg: number, subject: string} = useMemo(() => {
    if (map) {
      const turfMouse = turf.point([mouseCoords.lng, mouseCoords.lat])

      // provide range/bearing to selected item, if 1 feature is selected
      if (selection.length === 1) {
        const selectedFeature = features.find((feature) => feature.id === selection[0])
        if (selectedFeature) {
          // check it isn't a non-spatial feature
          if (hasEmptyCoordinates(selectedFeature)) {
            return {rng: 0, brg: 0, subject: 'n/a'} 
          } else {
            const asPoints = featureToPoints(selectedFeature)
            const nearestPt = nearestPoint(turfMouse, asPoints)
            const bearing = bearingToAzimuth(turf.bearing(nearestPt, turfMouse))
            const pointPos = turf.point(nearestPt.geometry.coordinates)
            const range = turf.distance(turfMouse, pointPos)
            // convert range from km to kiloyards
            const rangeM = range * 1000
            const rangeKly = rangeM / 914.4
            return {rng: rangeKly, brg: bearing, subject: selectedFeature.properties?.name || ''}  
          } 
        }
      }

      const mapCentre = map.getCenter()
      const turfCentre = turf.point([mapCentre.lng, mapCentre.lat])
      const bearing = bearingToAzimuth(turf.bearing(turfCentre, turfMouse))
      const range = turf.distance(turfCentre, turfMouse)
      return {rng: range, brg: bearing, subject: 'Map Center'}
    } else {
      return {rng: 0, brg: 0, subject: ''}
    }
  }, [mouseCoords, map, selection, features])

  const latString = useMemo(() => useNatoCoords ? formatNatoCoords(mouseCoords.lat, true, false, ' ') :
    formatCoordinate(mouseCoords.lat, true, false, ' '), [mouseCoords.lat, useNatoCoords])
  const lngString = useMemo(() => useNatoCoords ? formatNatoCoords(mouseCoords.lng, false, false, ' ') :
    formatCoordinate(mouseCoords.lng, false, false, ' '), [mouseCoords.lng, useNatoCoords])
  
  return !viewportFrozen && (<div className="mouse-coordinates-panel">
    <p>Lat: {latString}</p>
    <p>Lng: {lngString}</p>
    <p style={{ textAlign: 'end'}}><Switch size='small' onChange={() => setUseNatoCoords(!useNatoCoords)} checked={useNatoCoords}
      checkedChildren="DM.M" unCheckedChildren="DMS" /></p>
    <p>Rel to <b>{rangeBearing.subject}</b>:</p>
    <p>{`${('' + rangeBearing.rng.toFixed(1)).padStart(5, '0')} kyds`}/
      {`${('' + rangeBearing.brg.toFixed(1)).padStart(5, '0')} degs`}</p>
  </div>)
  
}

export default MouseCoordinates
