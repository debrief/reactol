import { useCallback, useEffect, useState } from 'react'
import { ToolButton } from '.'
import { Feature } from 'geojson'
import { useAppDispatch } from '../../state/hooks'
import { DiffOutlined } from '@ant-design/icons'

const isValidGeoJSON = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text)
    // Check if it's a Feature or FeatureCollection
    if (parsed.type === 'Feature') {
      return true
    }
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return true
    }
    if (Array.isArray(parsed)) {
      const featureArray = parsed as Feature[]
      if (featureArray.length && featureArray[0].type === 'Feature') {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

export const PasteButton: React.FC<{ setMessage: (message: string) => void }> = ({ setMessage }) => {
  const dispatch = useAppDispatch()
  const [pasteDisabled, setPasteDisabled] = useState(true)

  const checkClipboard = useCallback(  async () => {
    try {
      const text = await navigator.clipboard.readText()
      const isValid = isValidGeoJSON(text)
      setPasteDisabled(!isValid)
    } catch (error) {
      console.warn('Failed to read clipboard', error)
      setPasteDisabled(true)
    }
  }, [])

  useEffect(() => {
    // Initial check
    checkClipboard()

    // Set up clipboard change monitoring
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkClipboard()
      }
    }

    const handleFocus = () => {
      console.log('handle focus')
      checkClipboard()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkClipboard])

  const onPasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const parsed = JSON.parse(text)
      
      let features: Feature[]
      if (parsed.type === 'Feature') {
        features = [parsed]
      } else if (parsed.type === 'FeatureCollection') {
        features = parsed.features
      } else if (Array.isArray(parsed)) {
        features = parsed as Feature[]
      } else {
        throw new Error('Invalid GeoJSON format')
      }

      dispatch({
        type: 'fColl/featuresAdded',
        payload: features,
      })
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to paste GeoJSON data')
      setPasteDisabled(true)
    }
  }

  return (
    <ToolButton
      onClick={onPasteClick}
      disabled={pasteDisabled}
      icon={<DiffOutlined />}
      title={pasteDisabled ? 'No valid GeoJSON data in clipboard' : 'Paste GeoJSON data'}
    />
  )
}