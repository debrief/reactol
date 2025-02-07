import { Alert, Card, ConfigProvider, Modal, Splitter } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { TileLayer } from 'react-leaflet'
import { Feature, Geometry, GeoJsonProperties } from 'geojson'
import { useAppDispatch, useAppSelector } from '../../state/hooks'
import { useDocContext } from '../../state/DocContext'
import { AppDispatch } from '../../state/store'
import { NewTrackProps } from '../../types'
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

interface FileHandler {
  blobType: string
  handle: (text: string, features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, values?: NewTrackProps) => void
}

export interface TimeState {
  filterApplied: boolean
  start: number
  step: string
  end: number
}

const FileHandlers: FileHandler[] = [
  { blobType: 'application/json', handle: loadJson },
  { blobType: 'text/plain', handle: loadOpRep } 
]

function Document({ filePath }: { filePath?: string }) {
  const features = useAppSelector(state => state.fColl.features)
  const storeContents = useAppSelector(state => state.fColl)
  const dispatch = useAppDispatch()
  const [timeBounds, setTimeBounds] = useState<[number, number] | null>(null)
  const [graphOpen, setGraphOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { setTime, time, message, setMessage } = useDocContext()
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setDirty(true)
  }, [features])

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
      setMessage({ title: 'Error', severity: 'warning', message: 'Only one file can be loaded at a time' })
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
          setMessage({ title: 'Error', severity: 'error', message: 'Handling error: ' + e })
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
    setIsDialogVisible(false)
    console.log('adding data to track:' + trackId)
  }

  const doSave = useCallback(async () => {
    if (filePath && window.electron) {
      const doc = JSON.stringify(storeContents)
      await window.electron.saveFile(filePath, doc)  
    } else {
      window.alert('Local save not supportedin browser')
    }
  }, [filePath, storeContents])

  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <><div className="modal-back"/> <div className="drag-overlay">+</div></>}
      { !!message &&    <Modal title={message?.title} open={!!message} onCancel={() => setMessage(null)} okType='primary'  onOk={() => setMessage(null)}>
        <Alert showIcon type={message?.severity} description={message?.message} />
      </Modal> }
      <ConfigProvider theme={antdTheme}>
        <Splitter style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel key='left' collapsible defaultSize='300' min='200' max='600'>
            <Splitter layout="vertical" style={{ height: '100vh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
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

export default Document