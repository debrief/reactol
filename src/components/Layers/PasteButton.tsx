import { useCallback, useEffect, useState } from 'react'
import { ToolButton } from './ToolButton'
import { Feature } from 'geojson'
import { useAppDispatch } from '../../state/hooks'
import { DiffOutlined } from '@ant-design/icons'
import { useAppContext } from '../../state/AppContext'
import { useDocContext } from '../../state/DocContext'

// Importing the validation helper
import { isValidGeoJSON } from '../../helpers/geoJSONValidation'

export const PasteButton: React.FC = () => {
  const dispatch = useAppDispatch()
  const [pasteDisabled, setPasteDisabled] = useState(true)
  const { clipboardUpdated } = useAppContext()
  const { setMessage } = useDocContext()

  const checkClipboard = useCallback(async () => {
    // only bother checking clipboard if it has been used
    if (clipboardUpdated === null) {
      return
    }
    try {
      const text = await navigator.clipboard.readText()
      const isValid = isValidGeoJSON(text)
      setPasteDisabled(!isValid)
    } catch (error) {
      if (('' + error).includes('Document is not focused')) {
        // note: we get an error if dev-tools is open, ignore that error.
      } else {
        setMessage({ title: 'Error', severity: 'error', message: 'Failed to read clipboard: ' + error })
        console.warn('Failed to read clipboard', error)
        setPasteDisabled(true)
      }
    }
  }, [setMessage, clipboardUpdated])

  useEffect(() => {
    checkClipboard()
  }, [checkClipboard, clipboardUpdated])

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
      checkClipboard()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkClipboard])

  const onPasteClick = useCallback(async () => {
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
      setMessage({ title: 'Error', severity: 'error', message: 'Paste error: ' + e })
    }
    setPasteDisabled(true)
  }, [dispatch, setMessage, setPasteDisabled])

  return (
    <ToolButton
      onClick={onPasteClick}
      className='layers-paste-button'
      disabled={pasteDisabled}
      icon={<DiffOutlined />}
      title={pasteDisabled ? 'No valid GeoJSON data in clipboard' : 'Paste GeoJSON data'}
    />
  )
}