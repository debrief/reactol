import { Feature, MultiPoint, Point, Polygon } from 'geojson'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import ScaleNautic from 'react-leaflet-nauticsale'
import { useDispatch } from 'react-redux'
import { LatLngBounds } from 'leaflet'
import { ViewportChangeType } from '../../../state/geoFeaturesSlice'
import { BACKDROP_TYPE, BUOY_FIELD_TYPE, GROUP_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../../constants'
import Track from '../Track'
import Zone from '../Zone'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppSelector } from '../../../state/hooks'
import { selectFeatures } from '../../../state/geoFeaturesSlice'
import { useDocContext } from '../../../state/DocContext'
import { Point as DataPoint } from '../Point'
import { Graticule } from '../AutoGraticule'
import { HomeControl } from '../../HomeControl'
import MouseCoordinates from '../MouseCoordinates'
import { PolylineMeasure } from '../PolylineMeasure'
import { BuoyField } from '../BuoyField'
import { BackdropProps, BuoyFieldProps } from '../../../types'
import { EditFeature } from '../EditFeature'
import TimePeriod from '../TimePeriod'
import { formatCoordinate, formatNatoCoords } from '../../../helpers/formatCoordinate'
import { ATileLayer } from '../ATileLayer'

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

interface MapProps {
  children: React.ReactNode;
}

const featureFor = (feature: Feature, onClickHandler: (id: string, modifier: boolean) => void): React.ReactElement | null => {
  switch(feature.properties?.dataType) {
  case TRACK_TYPE:
    return <Track key={feature.id} feature={feature} onClickHandler={onClickHandler} /> 
  case ZONE_TYPE:
    return <Zone key={feature.id} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
  case REFERENCE_POINT_TYPE:
    return <DataPoint key={feature.id} feature={feature as Feature<Point>} onClickHandler={onClickHandler} /> 
  case BUOY_FIELD_TYPE:
    return <BuoyField key={feature.id} feature={feature as Feature<MultiPoint, BuoyFieldProps>} onClickHandler={onClickHandler} />
  case GROUP_TYPE:
    return null 
  case BACKDROP_TYPE:
    return <ATileLayer feature={feature as Feature<MultiPoint, BackdropProps>} />
  default:
    console.log('Unknown feature type:',feature)
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}

// Separate component for map features
const MapFeatures: React.FC<{
  features: Feature[],
  onClickHandler: (id: string, modifier: boolean) => void
}> = ({ features, onClickHandler }) => {
  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler)).filter(Boolean)
  }, [features, onClickHandler])

  return <>{visibleFeatures}</>
}

// Separate component for map controls
// Separate component to track viewport changes
const ViewportTracker: React.FC = () => {
  const map = useMap()
  const dispatch = useDispatch()
  const currentViewport = useAppSelector(state => state.fColl.present.viewport)
  const { preview } = useDocContext()
  const viewport = preview?.viewport || currentViewport

  const lastZoom = useRef(map.getZoom())
  const isInitialLoad = useRef(true)

  // Track map viewport changes and update Redux
  useMapEvents({
    moveend: () => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        return
      }

      const bounds = map.getBounds()
      const currentZoom = map.getZoom()
      
      // Determine the type of viewport change
      let changeType: ViewportChangeType = 'pan'
      if (currentZoom !== lastZoom.current) {
        changeType = currentZoom > lastZoom.current ? 'zoom_in' : 'zoom_out'
        lastZoom.current = currentZoom
      }

      const newViewport = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: currentZoom,
        changeType
      }

      // we need to compare viewport with newViewport, but we should ignore the `changeType` property
      const viewportWithoutChangeType = { ...viewport, changeType: undefined }
      const newViewportWithoutChangeType = { ...newViewport, changeType: undefined }

      // Only dispatch if viewport actually changed
      if (JSON.stringify(newViewportWithoutChangeType) !== JSON.stringify(viewportWithoutChangeType)) {
        dispatch({
          type: 'fColl/setViewport',
          payload: newViewport
        })
      }
    }
  })

  // Update map when viewport changes in Redux
  useEffect(() => {
    if (viewport && map) {
      const bounds = new LatLngBounds(
        [viewport.south, viewport.west],
        [viewport.north, viewport.east]
      )
      
      // Use animation for user-initiated changes, but not for undo/redo
      const animate = viewport.changeType !== 'restore'
      map.fitBounds(bounds, { animate })
      map.setZoom(viewport.zoom, { animate })
      
      // Update lastZoom to prevent triggering another change
      lastZoom.current = viewport.zoom
    }
  }, [viewport, map])

  return null
}

const MapControls: React.FC = () => {
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

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(selectFeatures)
  const { selection, setSelection, preview } = useDocContext()

  const theFeatures = preview ? preview.data.features : features

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selection.includes(id)) {
        setSelection(selection.filter((selectedId) => selectedId !== id))
      } else {
        setSelection([...selection, id])
      }
    } else {
      // just select this item
      setSelection([id])
    }
  }, [selection, setSelection])

  return (
    <MapContainer
      zoomControl={false}
      attributionControl={false}
      center={[35.505, -4.09]}
      zoom={8}
    >
      {children}
      <MapFeatures 
        features={theFeatures}
        onClickHandler={onClickHandler}
      />
      <ViewportTracker/>
      <MapControls/>
    </MapContainer>
  )
}

export default Map
