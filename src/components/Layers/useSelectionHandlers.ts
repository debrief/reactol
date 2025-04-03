import React, { useCallback } from 'react'
import { Feature } from 'geojson'
import { useAppDispatch } from '../../state/hooks'

// Import the proper types from the context
type MessageSeverity = 'success' | 'error' | 'warning' | 'info'

interface MessageStruct {
  title: string
  severity: MessageSeverity
  message: string
}

interface UseSelectionHandlersProps {
  features: Feature[]
  selection: string[]
  setSelection: (selection: string[]) => void
  setMessage: (message: MessageStruct | null) => void
  setClipboardUpdated: React.Dispatch<React.SetStateAction<boolean | null>> 
}

/**
 * Hook to manage selection-related operations in the Layers component
 */
export const useSelectionHandlers = ({
  features,
  selection,
  setSelection,
  setMessage,
  setClipboardUpdated
}: UseSelectionHandlersProps) => {
  const dispatch = useAppDispatch()

  const onCopyClick = useCallback(() => {
    // get the selected features
    const selected = features.filter((feature) =>
      selection.includes(feature.id as string)
    )
    const asStr = JSON.stringify(selected)
    navigator.clipboard.writeText(asStr).then(() => {
      // toggle the clipboardUpdated state
      setClipboardUpdated(clipboardUpdated => !clipboardUpdated)
    }).catch((e) => {
      setMessage({ title: 'Error', severity: 'error', message: 'Copy error: ' + e })
    })
  }, [features, selection, setClipboardUpdated, setMessage])

  const onDeleteClick = useCallback(() => {
    dispatch({
      type: 'fColl/featuresDeleted',
      payload: { ids: selection },
    })
    setSelection([])
  }, [dispatch, selection, setSelection])

  const clearSelection = useCallback(() => {
    setSelection([])
  }, [setSelection])

  const onSelect = (selectedKeys: React.Key[]) => {
    const cleaned = selectedKeys.filter(key => !(key as string).startsWith('node-'))
    if (JSON.stringify(cleaned) !== JSON.stringify(selection)) {
      setSelection(cleaned.map(key => key.toString()))
    }
  }

  return {
    onCopyClick,
    onDeleteClick,
    clearSelection,
    onSelect
  }
}
