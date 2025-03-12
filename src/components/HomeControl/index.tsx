import { useCallback, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useAppSelector } from '../../state/hooks'
import { useDispatch } from 'react-redux'
import { selectBounds, ViewportChangeType } from '../../state/geoFeaturesSlice'
import { Button, Tooltip } from 'antd'
import {
  ExpandOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { useDocContext } from '../../state/DocContext'

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

const buttonStyle = {
  display: 'block',
  margin: '4px',
  padding: '6px',
}

/** helper component providing a button with a tooltip */
const TipButton: React.FC<{
  tooltip: string
  onClick: () => void
  icon: React.ReactElement
}> = ({ tooltip, onClick, icon }) => {
  return (
    <Tooltip placement='right' title={tooltip}>
      <Button style={buttonStyle} onClick={onClick}>
        {icon}
      </Button>
    </Tooltip>
  )
}

/** component providing a `home` button which zooms out to show all visible data */
export const HomeControl: React.FC = () => {
  const map = useMap()
  const currentBounds = selectBounds(
    useAppSelector((state) => state.fColl.present)
  )
  const { viewportFrozen } = useDocContext()
  const measure = useRef<L.Control.PolylineMeasure | null>(null)

  const dispatch = useDispatch()

  const dispatchViewportChange = useCallback((bounds: L.LatLngBounds, changeType: ViewportChangeType) => {
    dispatch({
      type: 'fColl/setViewport',
      payload: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: map?.getZoom() || 0,
        changeType
      }
    })
  }, [dispatch, map])

  const doHome = useCallback(() => {
    if (map && currentBounds) {
      // Let the map update first
      map.flyToBounds(currentBounds)
      // Then dispatch the viewport change
      dispatchViewportChange(currentBounds, 'fit_to_window')
    }
  }, [map, currentBounds, dispatchViewportChange])

  const zoomIn = useCallback(() => {
    if (map) {
      // Let the map update first
      map.zoomIn()
      // Then dispatch the viewport change
      dispatchViewportChange(map.getBounds(), 'zoom_in')
    }
  }, [map, dispatchViewportChange])

  const zoomOut = useCallback(() => {
    if (map) {
      // Let the map update first
      map.zoomOut()
      // Then dispatch the viewport change
      dispatchViewportChange(map.getBounds(), 'zoom_out')
    }
  }, [map, dispatchViewportChange])

  useEffect(() => {
    if (map && measure.current) {
      if (viewportFrozen) {
        map.removeControl(measure.current)
      } else {
        measure.current.addTo(map)
      }
    }
  }, [map, measure, viewportFrozen])

  const position = 'topleft'
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

  return (
    <div style={{ paddingTop: '35px' }} className={positionClass}>
      <div
        className='leaflet-control leaflet-bar'
        style={{ display: viewportFrozen ? 'none' : 'block', border: '0 solid black' }}
      >
        <TipButton
          tooltip='Zoom in'
          onClick={zoomIn}
          icon={<ZoomInOutlined />}
        />
        <TipButton
          tooltip='Fit to visible data'
          onClick={doHome}
          icon={<ExpandOutlined />}
        />
        <TipButton
          tooltip='Zoom out'
          onClick={zoomOut}
          icon={<ZoomOutOutlined />}
        />
      </div>
    </div>
  )
}