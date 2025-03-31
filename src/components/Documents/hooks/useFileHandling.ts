import { useState, useCallback, ReactElement } from 'react'
import { TabWithPath } from '../index'
import App from '../../../App'

type MessageType = {
  title: string
  severity: 'error' | 'warning' | 'info'
  message: string
}

export const useFileHandling = (
  setTabs: React.Dispatch<React.SetStateAction<TabWithPath[]>>,
  addTabToLayout: (newTab: TabWithPath) => void
) => {
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<MessageType | null>(null)

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    // Only prevent default and show indicator if it's a file being dragged
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const files = event.dataTransfer.files

    if (files.length > 1) {
      setMessage({ 
        title: 'Error', 
        severity: 'warning', 
        message: 'Only one file can be loaded at a time' 
      })
      return
    }

    const file = files[0]
    
    // Check file extension
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.json') && !fileName.endsWith('.geojson')) {
      setMessage({ 
        title: 'Error', 
        severity: 'warning', 
        message: 'Only .json and .geojson files are supported' 
      })
      return
    }
    
    try {
      const content = await file.text()
      // Validate that the content is valid JSON
      try {
        const data = JSON.parse(content)
        if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
          throw new Error('File must contain a GeoJSON FeatureCollection or Feature')
        }
        
        // Create a new tab with the App component
        // Using a function to create the ReactElement to avoid JSX in .ts files
        const createAppElement = (): ReactElement => {
          return App({ 
            content, 
            fileName: file.name 
          })
        }
        
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: file.name.split('.')[0],
          children: createAppElement()
        }
        
        setTabs(prevTabs => [...prevTabs, newTab])
        addTabToLayout(newTab)
      } catch (e) {
        setMessage({ 
          title: 'Error', 
          severity: 'error', 
          message: 'The file content is not a valid JSON format. Please check the file and try again. ' + e 
        })
      }
    } catch (e) {
      console.error('Error handling file:', e)
      setMessage({ 
        title: 'Error', 
        severity: 'error', 
        message: 'Failed to load file: ' + e 
      })
    }
  }, [setTabs, addTabToLayout])

  return {
    isDragging,
    message,
    setMessage,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
