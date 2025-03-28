import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Feature } from 'geojson'
import { useDocContext } from '../../../state/DocContext'
import { useAppContext } from '../../../state/AppContext'

export const useSelectionManagement = (features: Feature[]) => {
  const { selection, setSelection, setMessage } = useDocContext()
  const { clipboardUpdated, setClipboardUpdated } = useAppContext()
  const treeRef = useRef<HTMLDivElement>(null)

  // Get selected features
  const selectedFeatures = useMemo(() => 
    features.filter((feature) => selection.includes(feature.id as string))
  , [features, selection])

  // Check if any selected feature has temporal data
  const temporalFeatureSelected = useMemo(() => 
    selectedFeatures.some((feature) => feature.properties?.times)
  , [selectedFeatures])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection([])
  }, [setSelection])

  // Copy selected features to clipboard
  const onCopyClick = useCallback(() => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      setClipboardUpdated(!clipboardUpdated)
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
    })
  }, [features, selection, clipboardUpdated, setClipboardUpdated, setMessage])

  // Delete selected features
  const onDeleteClick = useCallback(() => {
    // This will be handled by the useFeatureManagement hook
    // We'll just pass the selection IDs
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selection.length > 0) {
        // support delete key
        if (e.key === 'Delete') {
          onDeleteClick()
          e.stopPropagation()
        }
        // clear selection on `escape`
        if (e.key === 'Escape') {
          clearSelection()
          e.stopPropagation()
        }
        // copy items to clipboard on `copy`
        if (e.key === 'c' && e.ctrlKey) {
          onCopyClick()
          e.stopPropagation()
        }
      }
    }

    const treeElement = treeRef.current
    if (treeElement) {
      treeElement.addEventListener('keydown', handleKeyDown)
      return () => {
        treeElement.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selection, onDeleteClick, onCopyClick, clearSelection])

  return {
    selection,
    setSelection,
    selectedFeatures,
    temporalFeatureSelected,
    clearSelection,
    onCopyClick,
    onDeleteClick,
    treeRef
  }
}
