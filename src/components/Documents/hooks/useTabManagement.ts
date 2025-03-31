import { useState, useCallback } from 'react'
import { Action, Model } from 'flexlayout-react'
import { TabWithPath } from '../index'
import App from '../../../App'

/** Default document name used when creating new tabs */
const DEFAULT_DOC_NAME = 'Pending'

/**
 * Helper function to extract file name from path
 * 
 * @param filePath - The full path to the file
 * @returns The file name without extension
 */
const fileNameFor = (filePath: string): string => {
  const path = filePath
  const fileName = path.split('/').pop()!
  const fileNameWithoutExtension = fileName.split('.')[0]
  return fileNameWithoutExtension
}

/**
 * Custom hook that manages tab-related functionality for the Documents component.
 * 
 * This hook handles:
 * - Tab state management (creation, closing)
 * - New document creation (with or without sample data)
 * - Opening existing documents
 * - Modal dialog state for new tab creation
 * 
 * @param addTabToLayout - Function to add a new tab to the layout
 * @param layoutModel - The flexlayout model instance
 * @returns An object containing tab state and tab management functions
 */
export const useTabManagement = (
  addTabToLayout: (newTab: TabWithPath) => void,
  layoutModel: Model // Using the proper Model type from flexlayout-react
) => {
  const [tabs, setTabs] = useState<TabWithPath[]>([])
  const [tabToClose, setTabToClose] = useState<Action | null>(null)
  const [newTabState, setNewTabState] = useState<'empty' | 'samples' | null>(null)
  const [documentName, setDocumentName] = useState(DEFAULT_DOC_NAME)

  /**
   * Handles the creation of a new document
   * In Electron environment, opens a save dialog
   * In browser environment, opens a modal for document naming
   * 
   * @param withSample - Optional flag to include sample data in the new document
   */
  const handleNew = useCallback(async (withSample?: boolean) => {
    if (window.electron) {
      const options = { 
        title: 'New document', 
        filters: [{ name: 'GeoJSON Files', extensions: ['geojson', 'json'] }] 
      }
      const result = await window.electron.saveFileDialog(options)
  
      if (result?.filePath) {
        const filePath = result.filePath
        const fileName = fileNameFor(filePath)
  
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileName,
          children: App({ filePath, withSampleData: withSample })
        }
        setTabs(prevTabs => [...prevTabs, newTab])
        addTabToLayout(newTab)
      } else {
        console.log('Cancelled')
        return
      }
    } else {
      setNewTabState(withSample ? 'samples' : 'empty')
    }
  }, [addTabToLayout])

  /**
   * Handles the confirmation of creating a new document in the browser environment
   * Creates a new tab with the provided document name
   */
  const handleOk = useCallback(() => {
    const newTab: TabWithPath = {
      key: '' + Date.now(),
      label: documentName,
      children: App({ 
        withSampleData: newTabState === 'samples', 
        fileName: documentName 
      })
    }
    setNewTabState(null)
    addTabToLayout(newTab)
    setTabs(prevTabs => [...prevTabs, newTab])
    setDocumentName(DEFAULT_DOC_NAME)
  }, [addTabToLayout, documentName, newTabState])

  /**
   * Handles cancellation of the new document modal
   * Resets the document name and closes the modal
   */
  const handleCancel = useCallback(() => {
    setDocumentName(DEFAULT_DOC_NAME)
    setNewTabState(null)
  }, [])

  /**
   * Handles changes to the document name input field
   * 
   * @param e - The change event from the input field
   */
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value)
  }, [])

  /**
   * Opens an existing document from the file system
   * In Electron environment, uses the native file dialog
   * In browser environment, uses the browser's file input
   */
  const openExistingDocument = useCallback(async () => {
    if (window.electron) {
      const file = await window.electron.openFile()
      if (file) {
        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: fileNameFor(file.filePath),
          children: App({ filePath: file.filePath, content: file.content })
        }
        setTabs(prevTabs => [...prevTabs, newTab])
        addTabToLayout(newTab)
      }
    } else {
      // allow local files to be loaded into browser session
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.geojson,.json'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const content = await file.text()
        const data = JSON.parse(content)
        
        if (data.type !== 'FeatureCollection' && data.type !== 'Feature') {
          throw new Error('File must contain a GeoJSON FeatureCollection or Feature')
        }

        const newTab: TabWithPath = {
          key: '' + Date.now(),
          label: file.name.split('.')[0],
          children: App({ content, fileName: file.name })
        }
        setTabs(prevTabs => [...prevTabs, newTab])
        addTabToLayout(newTab)
      }
      input.click()
    }
  }, [addTabToLayout])

  /**
   * Confirms the closing of a tab
   * Executes the pending close action and updates the tabs state
   */
  const handleCloseTabConfirm = useCallback(() => {
    if (tabToClose) {
      layoutModel.doAction(tabToClose)
      setTabToClose(null)
      const tabToCloseNode = tabToClose.data.node
      setTabs(prevTabs => prevTabs.filter(tab => tab.key !== tabToCloseNode))
    }
  }, [tabToClose, layoutModel])

  /**
   * Cancels the tab closing operation
   * Clears the pending close action
   */
  const handleCloseTabCancel = useCallback(() => {
    setTabToClose(null)
  }, [])

  /**
   * Handles tab-related actions from the flexlayout component
   * Intercepts tab close actions to show a confirmation dialog
   * 
   * @param action - The action being performed on the tab
   * @returns The original action or undefined to cancel the action
   */
  const handleTabsAction = useCallback((action: Action): undefined | Action => {
    if (action.type.includes('DeleteTab')) {
      // Use the modal to double-check if the user wants to save
      setTabToClose(action)
      // Return undefined, so the close doesn't happen yet
      return undefined
    }
    return action
  }, [])

  /**
   * Return all the tab management state and functions
   */
  return {
    tabs,
    tabToClose,
    newTabState,
    documentName,
    handleNew,
    handleOk,
    handleCancel,
    handleNameChange,
    handleCloseTabConfirm,
    handleCloseTabCancel,
    handleTabsAction,
    openExistingDocument,
    setTabs
  }
}
