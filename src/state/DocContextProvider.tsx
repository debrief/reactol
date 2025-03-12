import { DocContext, EditableMapFeature, MessageStruct } from './DocContext'
import domToImage from 'dom-to-image'
import { useState, useCallback } from 'react'
import { TimeState } from '../components/Document'
import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { StoreState } from './geoFeaturesSlice'

interface Props {
  children: React.ReactNode;
}

export const DocContextProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([])
  const [viewportFrozen, setViewportFrozen] = useState(false)
  const [time, setTime] = useState<TimeState>({ filterApplied: false, start: 0,  step: '00h30m', end: 0, hardStart: 0, hardEnd: 0 })
  const [mapNode, setMapNode] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState<MessageStruct | null>(null)
  const [newFeature, setNewFeature] = useState<Feature<Geometry, GeoJsonProperties> | null>(null)
  const [editableMapFeature, setEditableMapFeature] = useState<EditableMapFeature | null>(null)
  const [interval, setInterval] = useState<number>(0)
  const [useNatoCoords, setUseNatoCoords] = useState<boolean>(true)
  const [preview, setPreview] = useState<StoreState | null>(null)

  const copyMapToClipboard = useCallback(async () => {
    if (!mapNode) {
      console.warn('Map node is not registered yet.')
      return
    }

    try {
      const width = mapNode.clientWidth
      const height = mapNode.clientHeight
      const imageBlob = await domToImage.toBlob(mapNode, { width, height })
      const clipboardItem = new ClipboardItem({ 'image/png': imageBlob })
      await navigator.clipboard.write([clipboardItem])
    } catch (error) {
      console.error('Failed to copy map to clipboard:', error)
    }
  }, [mapNode])

  return (
    <DocContext.Provider value={{ selection, setMapNode, setSelection, time, setTime, viewportFrozen, copyMapToClipboard, setViewportFrozen, message, setMessage, newFeature, setNewFeature, editableMapFeature, setEditableMapFeature, interval, setInterval, useNatoCoords, setUseNatoCoords, preview, setPreview }}>
      {children}
    </DocContext.Provider>
  )
}
