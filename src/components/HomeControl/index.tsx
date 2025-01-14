import { useCallback } from "react";
import { useMap } from "react-leaflet";
import { useAppSelector } from "../../app/hooks";
import { selectBounds } from "../../features/geoFeatures/geoFeaturesSlice";
import { Button, Tooltip } from "antd";
import { ExpandOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { useAppContext } from "../../context/AppContext";

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}

const buttonStyle = {
    display: 'block',
    margin: '4px',
    padding: '6px'
}

/** helper component providing a button with a tooltip */
const TipButton: React.FC<{tooltip: string, onClick: () => void, icon: React.ReactElement}> = ({tooltip, onClick, icon}) => {
    return <Tooltip placement="right" title={tooltip}>
        <Button style={buttonStyle} onClick={onClick}>{icon}</Button>
    </Tooltip>
}

/** component providing a `home` button which zooms out to show all visible data */
export const HomeControl: React.FC = () => {
    const map = useMap()
    const currentBounds = selectBounds(useAppSelector(state => state.featureCollection))
    const { viewportFrozen } = useAppContext();

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

    return <div style={{paddingTop: '60px'}} className={positionClass}>
      <div className="leaflet-control leaflet-bar" style={{display: viewportFrozen ? 'none' : 'block'}}>
        <TipButton tooltip="Zoom in"  onClick={zoomIn} icon={<ZoomInOutlined/>}/>
        <TipButton tooltip="Fit to visible data" onClick={doHome} icon={<ExpandOutlined/>}/>
        <TipButton tooltip="Zoom out" onClick={zoomOut} icon={<ZoomOutOutlined/>}/>
      </div>
    </div>
}