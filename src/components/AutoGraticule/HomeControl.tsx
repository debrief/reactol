import { useCallback } from "react";
import { useMap } from "react-leaflet";
import { useAppSelector } from "../../app/hooks";
import { selectBounds } from "../../features/geoFeatures/geoFeaturesSlice";
import { Button } from "antd";
import { HomeOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}
  
/** helper component providing a `home` button which zooms out to show all data */
export const HomeControl: React.FC = () => {
    const map = useMap()
    const currentBounds = selectBounds(useAppSelector(state => state.featureCollection))

    const doHome = useCallback(() => {
        if (map) {
            map.flyToBounds(currentBounds)
        }
    }, [map, currentBounds])

    const zoomIn = useCallback(() => {
        if (map) {
            map.zoomIn()
        }
    }, [map])


    const zoomOut = useCallback(() => {
        if (map) {
            map.zoomOut()
        }
    }, [map])

    const position = 'topleft'
    const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

    const buttonStyle = {
        display: 'block',
        margin: '2px'
    }

    return <div style={{paddingTop: '60px'}} className={positionClass}>
      <div className="leaflet-control leaflet-bar">
        <Button style={buttonStyle} onClick={() => zoomIn()}><PlusOutlined/></Button>
        <Button style={buttonStyle} onClick={() => doHome()}><HomeOutlined/></Button>
        <Button style={buttonStyle} onClick={() => zoomOut()}><MinusOutlined/></Button>
      </div>
    </div>
}