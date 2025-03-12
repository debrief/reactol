import { Alert, Card, ConfigProvider, Modal, Splitter, Tabs } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Feature, Geometry, GeoJsonProperties } from 'geojson'
import { useAppDispatch, useAppSelector } from '../../state/hooks'
import { useDocContext } from '../../state/DocContext'
import { AppDispatch } from '../../state/store'
import { ExistingTrackProps, NewTrackProps } from '../../types'
import { timeBoundsFor } from '../../helpers/timeBounds'
import { loadJson } from '../../helpers/loaders/loadJson'
import { loadOpRep } from '../../helpers/loaders/loadOpRep'
import Layers from '../Layers'
import Properties from '../Properties'
import Map from '../spatial/Map'
import GraphModal from '../GraphModal'
import { LoadTrackModel } from '../LoadTrackModal'
import './index.css'
import ControlPanel from '../ControlPanel'
import { GraphsPanel } from '../GraphsPanel'
import { TimeSupport } from '../../helpers/time-support'
import field from '../../data/buoyfield1'
import track1 from '../../data/track1'
import track2 from '../../data/track2'
import track3 from '../../data/track3'
import zones from '../../data/zones'
import points from '../../data/points'
import backdrop from '../../data/backdrop'
import { selectFeatures } from '../../state/geoFeaturesSlice'

interface FileHandler {
  blobType: string
  handle: (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, existingTrackDetails?: ExistingTrackProps, newTrackDetails?: NewTrackProps) => void
}

export interface TimeState {
  filterApplied: boolean
  start: number
  step: string
  end: number
  // the outer limits
  hardStart: number
  hardEnd: number
}

const fileHandlers: FileHandler[] = [
  { blobType: 'application/json', handle: loadJson },
  { blobType: 'text/plain', handle: loadOpRep } 
]

function Document({ filePath, withSampleData }: { filePath?: string, withSampleData?: boolean }) {
  const features = useAppSelector(selectFeatures)
  const storeContents = useAppSelector(state => state.fColl)
  const dispatch = useAppDispatch()
  const { setTime, time, message, setMessage, interval } = useDocContext()
  const [timeBounds, setTimeBounds] = useState<[number, number] | null>(null)
  const [graphOpen, setGraphOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dirty, setDirty] = useState(false)
  const loadedRef = useRef<boolean>(false)
  const [splitterHeights, setSplitterHeights] = useState<number[] | null>(null)
  const [splitterWidths, setSplitterWidths] = useState<number[] | null>(null)
  const [pendingOpRepFiles, setPendingOpRepFiles] = useState<File[] | null>(null)

  useEffect(() => {
    setDirty(true)
  }, [features])

  useEffect(() => {
    if (!loadedRef.current && withSampleData) {
      // (temporarily) load bulk selection
      const newData: Feature[] = [
        track1, track2, track3, field, ...zones, ...points, backdrop
      ]
      dispatch({ type: 'fColl/featuresAdded', payload: newData })
      loadedRef.current = true
    }

  }, [dispatch, loadedRef, withSampleData])

  useEffect(() => {
    if (features && features.length) {
      const timeBoundsVal = timeBoundsFor(features)
      if(timeBoundsVal) {
        setTimeBounds(timeBoundsVal)
        const timePayload = { filterApplied: false, start: timeBoundsVal[0], step: '00h30m', end: timeBoundsVal[1], hardStart: timeBoundsVal[0], hardEnd: timeBoundsVal[1] }
        setTime(timePayload)  
      } else {
        setTimeBounds(null)
        setTime({...time, filterApplied: false, start: 0, end: 0})
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, setTime])

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
    // only allow files to be dropped
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const files = event.dataTransfer.files

    const filesArray = Array.from(files)
    type FileAndHandler = {
      file: File
      handler: FileHandler | undefined
    }
    const filesAndHandlers = filesArray.map((file): FileAndHandler => ({ file, handler: fileHandlers.find(handler => handler.blobType === file.type) }))
    const textFiles = filesAndHandlers.filter(({ handler }) => handler?.blobType === 'text/plain')
    const otherFiles = filesAndHandlers.filter(({ handler }) => handler?.blobType !== 'text/plain')

    if (textFiles.length > 0) {
      setPendingOpRepFiles(textFiles.map(({ file }) => file))
    }
    for (let j = 0; j < otherFiles.length; j++) {
      const { file, handler } = otherFiles[j]
      if (handler) {
        try {
          handler.handle(await file.text(), features, dispatch)
        } catch (e) {
          console.error('handler error', file, handler, e)
          setMessage({ title: 'Error', severity: 'error', message: 'Handling error: ' + e })
        }
      }
    }
  }

  const loadNewTrack = async (values: NewTrackProps) => {
    if (pendingOpRepFiles) {
      // concatenate all of the file contents into one long string
      let fileContents = ''
      for(let i = 0; i < pendingOpRepFiles.length; i++) {
        fileContents += await pendingOpRepFiles[i].text() + '\n'
      }
      loadOpRep(fileContents, features, dispatch, undefined, values)
    }
    setPendingOpRepFiles(null)
  }

  const handleDialogCancel = () => {
    setPendingOpRepFiles(null)
  }

  const addToTrack = async (trackId: string) => {
    if (pendingOpRepFiles) {
      for (let i = 0; i< pendingOpRepFiles.length; i++){
        loadOpRep(await pendingOpRepFiles[i].text(), features, dispatch, { trackId }, undefined)
      }
    }
    setPendingOpRepFiles(null)
  }

  const doSave = useCallback(async () => {
    if (filePath && window.electron) {
      const doc = JSON.stringify(storeContents)
      await window.electron.saveFile(filePath, doc)  
    } else {
      window.alert('Local save not supportedin browser')
    }
  }, [filePath, storeContents])

  const detailTabs = [ {
    key: '1',
    label: 'Detail',
    children: <Properties />
  }, 
  { 
    key: '2',
    label: 'Graphs',
    children: <GraphsPanel width={splitterWidths ? splitterWidths[0] : 200} height={splitterHeights ? splitterHeights[2] : 200} />
  }]

  const handleSplitterVerticalResize = (sizes: number[]) => {
    setSplitterHeights(sizes)
  }

  const handleSplitterHorizontalResize = (sizes: number[]) => {
    setSplitterWidths(sizes)
  }

  const handleScroll = (event: React.WheelEvent) => {
    // check if we are in time filter mode
    if (!time.filterApplied) return
    const fwd = event.deltaY > 0
    const timeNow = new Date(time.start)
    const newStart = fwd
      ? TimeSupport.increment(timeNow, interval)
      : TimeSupport.decrement(timeNow, interval)
    const newEnd = TimeSupport.increment(newStart, interval)
    if (newEnd.getTime() >= time.hardStart && newStart.getTime() <= time.hardEnd) {
      const newTime = {
        ...time,
        start: newStart.getTime(),
        end: newEnd.getTime(),
      }
      setTime(newTime)
    }
  }

  return (
    <div style={{height: '100%' }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <><div className="modal-back"/> <div className="drag-overlay">+</div></>}
      { !!message &&    <Modal title={message?.title} open={!!message} onCancel={() => setMessage(null)} okType='primary'  onOk={() => setMessage(null)}>
        <Alert showIcon type={message?.severity} description={message?.message} />
      </Modal> }
      <ConfigProvider theme={antdTheme}>
        { /* introduce div, so we can catch wheel event */ }
        <div style={{width: '100%', height: '100%', overflow: 'hidden'}} onWheel={handleScroll}>
          <Splitter style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} onResizeEnd={handleSplitterHorizontalResize}>
            <Splitter.Panel key='left' collapsible defaultSize='300' min='200' max='600'>
              <Splitter layout="vertical" style={{ height: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}  onResizeEnd={handleSplitterVerticalResize}>
                <Splitter.Panel defaultSize='170' min='170' max='170' resizable={false}>
                  <Card title='Control Panel'>
                    <ControlPanel isDirty={dirty} handleSave={doSave} bounds={timeBounds}/>
                  </Card>
                </Splitter.Panel>
                <Splitter.Panel>
                  <Card title='Layers' style={{width: '100%', height: '100%'}} >
                    { features && <Layers openGraph={() => setGraphOpen(true)} /> }
                  </Card>
                </Splitter.Panel>
                <Splitter.Panel>
                  <Tabs defaultActiveKey="1" id="detail-tabs" items={detailTabs} />
                </Splitter.Panel>
              </Splitter>
            </Splitter.Panel>
            <Splitter.Panel key='right'>
              <Map>
                <></>
              </Map>
            </Splitter.Panel>
          </Splitter>
        </div>

        <GraphModal open={graphOpen} doClose={() => setGraphOpen(false)} />
      </ConfigProvider>
      <LoadTrackModel visible={!!pendingOpRepFiles} cancel={handleDialogCancel} 
        newTrack={loadNewTrack} addToTrack={addToTrack} />
    </div>
  )
}

export default Document