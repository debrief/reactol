import { Alert, Card, ConfigProvider, Modal, Splitter } from 'antd'
import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import Layers from './components/Layers'
import Properties from './components/Properties'
import TimeControl from './components/TimeControl'
import { timeBoundsFor } from './helpers/timeBounds.ts'
import { useAppDispatch, useAppSelector } from './state/hooks.ts'
import track from './data/track1.ts'
import track2 from './data/track2.ts'
import track3 from './data/track3.ts'
import zones from './data/zones.ts'
import points from './data/points.ts'
import Map from './components/spatial/Map/index.tsx'
import GraphModal from './components/GraphModal'
import { useAppContext } from './state/AppContext.ts'
import { TileLayer } from 'react-leaflet'
import { loadJson } from './helpers/loaders/loadJson.ts' // Import the load function
import { loadOpRep } from './helpers/loaders/loadOpRep.ts' // Import the loadOpRep function
import { Feature, Geometry, GeoJsonProperties } from 'geojson'
import Control from 'react-leaflet-custom-control'
import toDTG from './helpers/toDTG.ts'
import { AppDispatch } from './state/store.ts'
import { LoadTrackModel } from './components/LoadTrackModal'
import { NewTrackProps } from './types.ts'

interface FileHandler {
  blobType: string
  handle: (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, values?: NewTrackProps) => void
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
  const features = useAppSelector(state => state.fColl.features)
  const dispatch = useAppDispatch()
  const [timeBounds, setTimeBounds] = useState<[number, number] | null>(null)
  const [graphOpen, setGraphOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // State to track if a file is being dragged
  const [error, setError] = useState<string | null>(null) // State to track error messages
  const { setTime, time } = useAppContext()

  const storeInitialised = useRef(false) 

  useEffect(() => {
    if (!storeInitialised.current) {
      storeInitialised.current = true
      console.clear()
      // store initial data objects
      dispatch({ type: 'fColl/storeCleared'})
      dispatch({ type: 'fColl/featureAdded', payload: track })
      dispatch({ type: 'fColl/featureAdded', payload: track2 })
      dispatch({ type: 'fColl/featureAdded', payload: track3 })
      dispatch({ type: 'fColl/featuresAdded', payload: zones })
      dispatch({ type: 'fColl/featuresAdded', payload: points })
    }
  }, [dispatch])


  const timePeriod = useMemo(() => {
    if (time.start && time.end) {
      const formattedTimePeriod = `${toDTG(new Date(time.start))} - ${toDTG(new Date(time.end))}`
      return formattedTimePeriod  
    } else {
      return 'Pending'
    }
  }, [time])

  useEffect(() => {
    if (features && features.length) {
      const timeBoundsVal = timeBoundsFor(features)
      if(timeBoundsVal) {
        setTimeBounds(timeBoundsVal)
        const timePayload = { filterApplied: false, start: timeBoundsVal[0], step: '00h30m', end: timeBoundsVal[1] }
        setTime(timePayload)  
      } else {
        setTimeBounds(null)
        setTime({...time, filterApplied: false, start: 0, end: 0})
      }
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
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const files = event.dataTransfer.files

    if (files.length > 1) {
      console.log('too many files error')
      setError('Only one file can be loaded at a time')
      return
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const handler = file && FileHandlers.find(handler => handler.blobType === file.type)
      if (handler) {
        try {
          if (file.type === 'text/plain') {
            showDialog(file, handler)
          } else {
            handler.handle(await file.text(), features, dispatch)
          }
        } catch (e) {
          console.log('handler error', e)
          setError('' + e) // Set error message
        }
      }
    }
  }

  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [currentHandler, setCurrentHandler] = useState<FileHandler | null>(null)

  const showDialog = (file: File, handler: FileHandler) => {
    setCurrentFile(file)
    setCurrentHandler(handler)
    setIsDialogVisible(true)
  }

  const setLoadTrackResults = async (values: NewTrackProps) => {
    setIsDialogVisible(false)
    if (currentFile && currentHandler) {
      currentHandler.handle(await currentFile.text(), features, dispatch, values)
    }
  }

  const handleDialogCancel = () => {
    setIsDialogVisible(false)
  }

  const addToTrack = (trackId: string) => {
    // Implement the logic to add position data to an existing track
    // You can use the trackId and values to update the existing track
    setIsDialogVisible(false)
    window.alert('adding data to track:' + trackId)
  }

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <><div className="modal-back"/> <div className="drag-overlay">+</div></>}
      <Modal title="Loading Error" open={!!error} onCancel={() => setError(null)} onOk={() => setError(null)}>
        <Alert type="error" description={error} />
      </Modal>
      {error && <div className="error-modal">{error}</div>} {/* Error modal */}
      <ConfigProvider theme={antdTheme}>
        <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize='300' min='200' max='600'>
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
              <Splitter.Panel defaultSize='170' min='170' max='170' resizable={false}>
                <Card title='Time Control'>
                  <TimeControl bounds={timeBounds}/>
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
                <div className='time-period'>
                  {timePeriod}
                </div>
              </Control>
            </Map>
          </Splitter.Panel>
        </Splitter>
        <GraphModal open={graphOpen} doClose={() => setGraphOpen(false)} />
      </ConfigProvider>
      <LoadTrackModel visible={isDialogVisible} cancel={handleDialogCancel} 
        newTrack={setLoadTrackResults} addToTrack={addToTrack} />
    </div>
  )
}

export default App
