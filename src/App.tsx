import { Card, ConfigProvider, Flex, Splitter, Typography } from "antd";
import "./App.css";
import MapComponent from "@terrestris/react-geo/dist/Map/MapComponent/MapComponent";
import MapContext from "@terrestris/react-util/dist/Context/MapContext/MapContext";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import { LayerTree } from "@terrestris/react-geo";
import OlSourceOSM from "ol/source/OSM";
import { transform } from "ol/proj";
import "antd/dist/reset.css";
import "./react-geo.css";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import track1 from "./assets/track1.json";
import points from "./assets/points.json";
import GeoJSON from "ol/format/GeoJSON.js";
import Style from "ol/style/Style";
import { Circle, Fill, Stroke } from "ol/style";
import Feature from "ol/Feature";
import { Circle as CircleGeom } from "ol/geom";
import { useMap } from "@terrestris/react-util";

const Desc: React.FC<Readonly<{ text?: string | number }>> = (props) => (
  <Flex justify="center" align="center" style={{ height: "100%" }}>
    <Typography.Title
      type="secondary"
      level={5}
      style={{ whiteSpace: "nowrap" }}
    >
      {props.text}
    </Typography.Title>
  </Flex>
);

const circleFeature = new Feature({
  geometry: new CircleGeom(
    transform([-6.2685, 35.8192], "EPSG:4326", "EPSG:3857"),
    10000
  ),
});

const vectorSource = new VectorSource({
  features: new GeoJSON().readFeatures(track1),
});
vectorSource.getFeatures().push(circleFeature);

const pointSource = new VectorSource({
  features: new GeoJSON().readFeatures(points),
});

const style = new Style({
  fill: new Fill({
    color: "rgba(255, 100, 50, 0.3)",
  }),
  stroke: new Stroke({
    width: 2,
    color: "rgba(255, 100, 50, 0.8)",
  }),
  image: new Circle({
    fill: new Fill({
      color: "rgba(55, 200, 150, 0.5)",
    }),
    stroke: new Stroke({
      width: 1,
      color: "rgba(55, 200, 150, 0.8)",
    }),
    radius: 7,
  }),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: style,
  properties: {
    name: "Tracks",
  },
});

const pointLayer = new VectorLayer({
  source: pointSource,
  style: style,
  properties: {
    name: "Points",
  },
});

const map = new OlMap({
  layers: [
    new OlLayerTile({
      properties: {
        name: "OSM",
      },
      source: new OlSourceOSM(),
    }),
    vectorLayer,
    pointLayer,
  ],
  view: new OlView({
    center: transform([-3, 36], "EPSG:4326", "EPSG:3857"),
    zoom: 7,
  }),
});

function App() {
  const map_ = useMap();
  console.log(map_, "map");
  return (
    <div className="App">
      <ConfigProvider
        theme={{
          components: {
            Splitter: {
              splitBarSize: 10,
            },
          },
        }}
      >
        <MapContext.Provider value={map}>
          <Splitter
            style={{
              height: "100vh",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Splitter.Panel
              key="left"
              collapsible
              defaultSize="20%"
              min="20%"
              max="70%"
            >
              <Splitter
                layout="vertical"
                style={{
                  height: "100vh",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Splitter.Panel
                  defaultSize="20%"
                  min="10%"
                  max="20%"
                  resizable={true}
                >
                  <Desc text="Time Control" />
                </Splitter.Panel>
                <Splitter.Panel>
                  <Card
                    title="Layers"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <LayerTree />
                  </Card>
                </Splitter.Panel>
                <Splitter.Panel>
                  <Card title="Properties">
                    <Desc text="Property editor here" />
                  </Card>
                </Splitter.Panel>
              </Splitter>
            </Splitter.Panel>
            <Splitter.Panel key="right">
              <MapComponent id="map" map={map} />
            </Splitter.Panel>
          </Splitter>
        </MapContext.Provider>
      </ConfigProvider>
    </div>
  );
}

export default App;
