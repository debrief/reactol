import { Control } from "leaflet";
import { useState, useRef, useEffect } from "react";
import { useMap } from "react-leaflet";
import { useAppSelector } from "../../app/hooks";
import { selectBounds } from "../../features/geoFeatures/geoFeaturesSlice";

/** helper component providing a `home` button which zooms out to show all data */
export const HomeControl: React.FC = () => {
    const map = useMap()
    const currentBounds = selectBounds(useAppSelector(state => state.featureCollection))
    const [existing, setExisting] = useState<Control | undefined>(undefined)
    const controlInitialised = useRef(false); 

    const doHome = () => {
        // TODO: this just uses the original bounds, not the current bounds, it should use the current bounds
        console.log('doing fly home to', currentBounds.getCenter().lat, currentBounds.getCenter().lng)
        map.flyToBounds(currentBounds)
    }


    // note: we need to return a Leaflet control.  It will have a house
    // icon that when clicked will fly the map to the current bounds, via the DoHome function
    useEffect(() => {
        if (map && !controlInitialised.current) {
            if (existing) {
                existing.remove()
            }
            const control = new Control({position: 'topleft'})
            control.onAdd = () => {
                const div = document.createElement('div')
                div.className = 'leaflet-bar leaflet-control leaflet-control-custom'
                div.innerHTML = '<a href="#" title="Home" role="button" aria-label="Home" class="leaflet-bar-part leaflet-bar-part-single" id="home" onclick="return false;">🏠</a>'
                div.onclick = doHome
                return div
            }
            control.addTo(map)
            setExisting(control)
            controlInitialised.current = true
        }
    },[map])

    return null
}