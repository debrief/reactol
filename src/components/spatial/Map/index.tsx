import { Feature, Point, Polygon } from "geojson";
import { MapContainer, ScaleControl, useMap } from "react-leaflet";
import { REFERENCE_POINT_TYPE, TRACK_TYPE, ZONE_TYPE } from "../../../constants";
import Track from "../Track";
import Zone from "../Zone";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "../../../state/hooks";
import { useAppContext } from "../../../state/AppContext";
import { Point as DataPoint } from "../Point";
import MouseCoordinates from "../MouseCoordinates";
import { Graticule } from "../AutoGraticule";
import { HomeControl } from "../../HomeControl";
import domToImage from "dom-to-image";
import L from "leaflet";

const isVisible = (feature: Feature): boolean => {
  return feature.properties?.visible
}

interface MapProps {
  children: React.ReactNode;
}

const featureFor = (feature: Feature, onClickHandler: (id: string, modifier: boolean) => void): React.ReactElement => {
  switch(feature.properties?.dataType) {
    case TRACK_TYPE:
    return <Track key={feature.id} feature={feature} onClickHandler={onClickHandler} /> 
    case ZONE_TYPE:
    return <Zone key={feature.id} feature={feature as Feature<Polygon>} onClickHandler={onClickHandler}/>  
    case REFERENCE_POINT_TYPE:
    return <DataPoint key={feature.id} feature={feature as Feature<Point>} onClickHandler={onClickHandler} /> 
    default:
    throw new Error('Unknown feature type:' + feature.properties?.dataType)
  }
}

/** helper component that freezer map viewport */
const ViewportProperties: React.FC<{ frozen: boolean }> = ({frozen}) => {
  const map = useMap()
  useEffect(() => {
    if (map) {
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
  },[map, frozen])
  return null
}

// Custom control to add the "Copy to Clipboard" button on the map
const CopyToClipboardControl: React.FC = () => {
  const map = useMap()

  useEffect(() => {
    const copyMapToClipboard = async () => {
      const mapNode = map.getContainer() // Get the map container DOM element

      try {
        const width = mapNode.clientWidth
        const height = mapNode.clientHeight
        const imageBlob = await domToImage.toBlob(mapNode, { width, height })
        const clipboardItem = new ClipboardItem({ "image/png": imageBlob })
        await navigator.clipboard.write([clipboardItem])
        const buttonElement = document.querySelector(".leaflet-control-custom") as HTMLElement
        if (buttonElement) {
          buttonElement.innerText = "✅ Copied"
          setTimeout(() => {
            buttonElement.innerText = "📋 clipboard"
          }, 3000)
        }
      } catch (error) {
        console.error("Clipboard:", error)
      }
    }

    const CopyControl = L.Control.extend({
      onAdd: () => {
        const button = L.DomUtil.create("button", "leaflet-bar leaflet-control leaflet-control-custom");
        button.innerText = "📋 clipboard";
        button.style.cursor = "pointer";
        button.style.backgroundColor = "white";
        button.style.border = "1px solid #ccc";
        button.style.padding = "5px";
        button.onclick = copyMapToClipboard;
        return button;
      },
    });

    // Add the control to the map
    const control = new CopyControl({ position: "topleft" });
    map.addControl(control)

     // Adjust the position with CSS
  const buttonElement = document.querySelector(".leaflet-control-custom") as HTMLElement
  if (buttonElement) {
    buttonElement.style.marginTop = "-50px"
  }

    // Cleanup on unmount
    return () => {
      map.removeControl(control)
    };
  }, [map]);

  return null;
};

const Map: React.FC<MapProps> = ({ children }) => {
  const features = useAppSelector(state => state.featureCollection.features)
  const { selection, setSelection, viewportFrozen } = useAppContext();
  const mapRef = useRef<any>(null)


  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
      if (modifier) {
      // add/remove from selection
        if (selection.includes(id)) {
          setSelection(selection.filter((selectedId) => selectedId !== id));
        } else {
          setSelection([...selection, id]);
        }
      } else {
      // just select this item
        setSelection([id]);
      }
  }, [selection, setSelection])

  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler))
  }, [features, onClickHandler])

  return (
    <>
      <MapContainer
        zoomControl={false}
        center={[35.505, -4.09]}
        zoom={8}
        ref={mapRef}
      >
        <ViewportProperties frozen={viewportFrozen} />
        {children}
        { 
          visibleFeatures
        }
        <MouseCoordinates/>
        <ScaleControl imperial={true} metric={false} position={'bottomleft'}/>
        <Graticule/>
        <HomeControl/>
        <CopyToClipboardControl />
      </MapContainer>

    </>
  );
};

export default Map
