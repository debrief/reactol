import { Feature, Geometry} from 'geojson'
import { TileLayer } from 'react-leaflet'
import { useMemo } from 'react'
import { BackdropProps } from '../../../types'

export interface ATileLayerProps {
  feature: Feature<Geometry, BackdropProps> 
}

export const ATileLayer: React.FC<ATileLayerProps> = ({feature}) => {
  const backProps = feature.properties as BackdropProps

  const element = useMemo(() => {
    if (backProps.visible) {
      return <TileLayer key={feature.id} maxNativeZoom={backProps.maxNativeZoom} maxZoom={backProps.maxZoom} url={backProps.url}  />
    }
    return null
  }, [backProps, feature])

  return element
}
