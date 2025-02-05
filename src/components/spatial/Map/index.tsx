import { Feature, MultiPoint, Point, Polygon } from 'geojson'
import { MapContainer, useMap } from 'react-leaflet'
import ScaleNautic from 'react-leaflet-nauticsale'
import { BUOY_FIELD_TYPE, GROUP_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from '../../../constants'
import Track from '../Track'
import Zone from '../Zone'
import { useCallback, useEffect, useMemo } from 'react'
import { useAppSelector } from '../../../state/hooks'
import { useDocContext } from '../../../state/DocContext'
import { Point as DataPoint } from '../Point'
import { Graticule } from '../AutoGraticule'
import { HomeControl } from '../../HomeControl'
import MouseCoordinates from '../MouseCoordinates'
import { PolylineMeasure } from '../PolylineMeasure'
import { BuoyField } from '../BuoyField'
import { BuoyFieldProps } from '../../../types'

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
  default:
    console.log('Unknown feature type:',feature)
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}

/** helper component that freezer map viewport */
const ViewportProperties: React.FC<{ frozen: boolean }> = ({frozen}) => {
  const map = useMap()
  const { setMapNode } = useDocContext()

  useEffect(() => {

    if (map) {
      setMapNode(map.getContainer())
      if (frozen) {
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
  },[map, frozen, setMapNode])
  return null
}

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.fColl.features)
  const { selection, setSelection, viewportFrozen } = useDocContext()

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

  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler)).filter(Boolean)
  }, [features, onClickHandler])

  return (
    <>
      <MapContainer
        zoomControl={false}
        attributionControl={false}
        center={[35.505, -4.09]}
        zoom={8}
      >
        <ViewportProperties frozen={viewportFrozen} />
        {children}
        { 
          visibleFeatures
        }
        <MouseCoordinates/>
        <ScaleNautic nautic={true} metric={false} imperial={false} />
        <Graticule/>
        <PolylineMeasure/>
        <HomeControl/>
      </MapContainer>

    </>
  )
}

export default Map
