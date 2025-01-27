import { useCallback, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useAppSelector } from '../../state/hooks'
import { selectBounds } from '../../state/geoFeaturesSlice'
import { Button, Tooltip } from 'antd'
import {
  ExpandOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { useAppContext } from '../../state/AppContext'
import 'leaflet.polylinemeasure'
import L from 'leaflet'
import './Leaflet.PolylineMeasure.css'
import './index.css'

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

// TypeScript interface for polylineMeasure options.
// note: we're extending the official types, since 
// some fields are missing.
interface PolylineMeasureOptions extends L.Control.PolylineMeasureOptions {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  unit: 'kilometres' | 'landmiles' | 'nauticalmiles';
  showBearings: boolean;
  clearMeasurementsOnStop: boolean;
  showClearControl: boolean;
  showUnitControl: boolean;
  unitControlUnits?: Array<'kilometres' | 'landmiles' | 'nauticalmiles'>;
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
    useAppSelector((state) => state.fColl)
  )
  const { viewportFrozen } = useAppContext()
  const measure = useRef<L.control.polylineMeasure | null>(null)

  const doHome = useCallback(() => {
    if (map && currentBounds) {
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

  useEffect(() => {
    if (map && !measure.current) {
      const options: PolylineMeasureOptions = {
        position: 'bottomright',
        unit: 'nauticalmiles',
        showBearings: false,
        clearMeasurementsOnStop: true,
        showClearControl: true,
        showUnitControl: true,
        unitControlUnits: ['kilometres', 'landmiles', 'nauticalmiles']
      }

      const ruler = L.control.polylineMeasure(options)
      ruler.addTo(map)
      measure.current = ruler

      return () => {
        if (measure.current) {
          map.removeControl(measure.current)
          measure.current = null
        }
      }
    }
  }, [map])

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
    <div style={{ paddingTop: '60px' }} className={positionClass}>
      <div
        className='leaflet-control leaflet-bar'
        style={{ display: viewportFrozen ? 'none' : 'block' }}
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