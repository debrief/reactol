import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { useAppContext } from '../../../state/AppContext'

import 'leaflet.polylinemeasure'
import L from 'leaflet'
import './Leaflet.PolylineMeasure.css'
import './index.css'

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

/** helper component that freezer map viewport */
export const PolylineMeasure: React.FC = () => {
  const map = useMap()
  const { viewportFrozen } = useAppContext()
  const measure = useRef<L.Control.PolylineMeasure | null>(null)

  useEffect(() => {
    if (map && measure.current) {
      if (viewportFrozen) {
        map.removeControl(measure.current)
      } else {
        measure.current.addTo(map)
      }
    }
  }, [map, measure, viewportFrozen])
  
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

  return null
}