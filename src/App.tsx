import { Alert, Card, ConfigProvider, Modal, Splitter } from 'antd';
import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Layers from './components/Layers.tsx';
import Properties from './components/Properties.tsx';
import TimeControl from './components/TimeControl.tsx';
import { timeBoundsFor } from './helpers/timeBounds.ts';
import { useAppDispatch, useAppSelector } from './app/hooks.ts';
import track from './data/track1.ts';
import track2 from './data/track2.ts';
import track3 from './data/track3.ts';
import zones from './data/zones.ts';
import points from './data/points.ts';
import Map from './components/Map.tsx';
import GraphModal from './components/GraphModal.tsx';
import { useAppContext } from './context/AppContext.tsx';
import { TileLayer } from 'react-leaflet';
import { loadJson } from './helpers/loaders/loadJson.ts'; // Import the load function
import { loadOpRep } from './helpers/loaders/loadOpRep.ts'; // Import the loadOpRep function
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import Control from 'react-leaflet-custom-control';
import toDTG from './helpers/toDTG.ts';
import { AppDispatch } from './app/store.ts';

interface FileHandler {
  blobType: string
  handle: (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, year?: number, month?: number, name?: string) => void
}

export interface TimeState {
  filterApplied: boolean;
  start: number;
  step: string;
  end: number;
}

const FileHandlers: FileHandler[] = [
  { blobType: 'application/json', handle: loadJson },
  { blobType: 'text/plain', handle: loadOpRep } // Add the loadOpRep handler
]

function App() {
  const features = useAppSelector(state => state.featureCollection.features)
  const dispatch = useAppDispatch()
  const [timeBounds, setTimeBounds] = useState<[number, number]>([0, 0])
  const [graphOpen, setGraphOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false); // State to track if a file is being dragged
  const [error, setError] = useState<string | null>(null); // State to track error messages
  const { setTime, time } = useAppContext();

  const storeInitialised = useRef(false); 
  const timeInitialised = useRef(false);

  useEffect(() => {
    if (!storeInitialised.current) {
      storeInitialised.current = true
      console.clear()
      // store initial data objects
      dispatch({ type: 'featureCollection/clearStore'})
      dispatch({ type: 'featureCollection/featureAdded', payload: track })
      dispatch({ type: 'featureCollection/featureAdded', payload: track2 })
      dispatch({ type: 'featureCollection/featureAdded', payload: track3 })
      dispatch({ type: 'featureCollection/featuresAdded', payload: zones })
      dispatch({ type: 'featureCollection/featuresAdded', payload: points })
    }
  }, [dispatch])


  const timePeriod = useMemo(() => {
    const formattedTimePeriod = `${toDTG(new Date(time.start))} - ${toDTG(new Date(time.end))}`;
    return formattedTimePeriod;
  }, [time]);


  useEffect(() => {
    if (features && features.length && !timeInitialised.current) {
      timeInitialised.current = true
      const timeBounds = timeBoundsFor(features)
      setTimeBounds(timeBounds)
      const timePayload = { filterApplied: false, start: timeBounds[0], step: '00h30m', end: timeBounds[1] }
      setTime(timePayload)
    }
  }, [features])

  const antdTheme = {
    components: {
      Splitter: {
        splitBarSize: 10,
      },
      Table: {
        headerBg: '#555',
        headerColor: '#fff'
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    var files = event.dataTransfer.files;

    if (files.length > 1) {
      setError('Only one file can be loaded at a time');
      return
    }

    for (var i = 0; i < files.length; i++) {
      const file = files[i]
      const handler = file && FileHandlers.find(handler => handler.blobType === file.type);
      if (handler) {
        try {
          if (file.type === 'text/plain') {
            showDialog(file, handler);
          } else {
            handler.handle(await file.text(), features, dispatch);
          }
        } catch (e) {
          setError('' + e); // Set error message
        }
      }
    }
  };

  const [year, setYear] = useState<number | null>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(new Date().getMonth() + 1);
  const [name, setName] = useState<string | null>('pending');
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentHandler, setCurrentHandler] = useState<FileHandler | null>(null);

  const showDialog = (file: File, handler: FileHandler) => {
    setCurrentFile(file);
    setCurrentHandler(handler);
    setIsDialogVisible(true);
  };

  const handleDialogOk = async () => {
    setIsDialogVisible(false);
    if (currentFile && currentHandler && year && month && name) {
      currentHandler.handle(await currentFile.text(), features, dispatch, year, month, name);
    }
  };

  const handleDialogCancel = () => {
    setIsDialogVisible(false);
    // End the loading process
  };

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <><div className="modal-back"/> <div className="drag-overlay">+</div></>}
      <Modal title="Loading Error" open={!!error} onCancel={() => setError(null)} onOk={() => setError(null)}>
        <Alert type="error" description={error} />
      </Modal>
      {error && <div className="error-modal">{error}</div>} {/* Error modal */}
      <ConfigProvider theme={antdTheme}>
          <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
            <Splitter.Panel key='left' collapsible defaultSize="20%" min="20%" max="70%">
              <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <Splitter.Panel defaultSize="20%" min="10%" max="20%" resizable={true}>
                  <Card title='Time Control'>
                    {timeBounds && 
                      <TimeControl start={timeBounds[0]} end={timeBounds[1]} />}
                  </Card>
                </Splitter.Panel>
                <Splitter.Panel>
                  <Card title='Layers' style={{width: '100%', height: '100%'}} >
                    { features && <Layers openGraph={() => setGraphOpen(true)} /> }
                  </Card>
                </Splitter.Panel>
                <Splitter.Panel>
                  <Card title='Detail'>
                    <Properties />
                  </Card>
                </Splitter.Panel>
              </Splitter>
            </Splitter.Panel>
            <Splitter.Panel key='right'>
              <Map>
                <TileLayer maxNativeZoom={8} maxZoom={16}
                  url="tiles/{z}/{x}/{y}.png"
                />
                <Control prepend position='topleft'>
                  <div className='time-period' style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                    {timePeriod}
                  </div>
                </Control>
              </Map>
            </Splitter.Panel>
          </Splitter>
          <GraphModal open={graphOpen} doClose={() => setGraphOpen(false)} />
      </ConfigProvider>
      <Modal
        title="Enter Missing Fields"
        visible={isDialogVisible}
        onOk={handleDialogOk}
        onCancel={handleDialogCancel}
      >
        <div>
          <label>Year:</label>
          <input type="number" value={year || ''} onChange={(e) => setYear(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Month:</label>
          <input type="number" value={month || ''} onChange={(e) => setMonth(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={name || ''} onChange={(e) => setName(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}

export default App
