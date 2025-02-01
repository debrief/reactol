import { DocContext } from './DocContext'
import domToImage from 'dom-to-image'
import { useState, useCallback } from 'react'
import { TimeState } from '../components/Document'

interface Props {
  children: React.ReactNode;
}

export const DocContextProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([])
  const [viewportFrozen, setViewportFrozen] = useState(false)
  const [time, setTime] = useState<TimeState>({ filterApplied: false, start: 0,  step: '00h30m', end: 0 })
  const [mapNode, setMapNode] = useState<HTMLElement | null>(null)

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
    <DocContext.Provider value={{ selection, setMapNode, setSelection, time, setTime, viewportFrozen, copyMapToClipboard, setViewportFrozen }}>
      {children}
    </DocContext.Provider>
  )
}
