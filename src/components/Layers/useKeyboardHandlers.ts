import { useEffect, RefObject } from 'react'

interface KeyboardHandlerProps {
  selection: string[]
  onDeleteClick: () => void
  onCopyClick: () => void
  clearSelection: () => void
  elementRef: RefObject<HTMLDivElement | null>
}

/**
 * Hook to handle keyboard shortcuts for the Layers component
 */
export const useKeyboardHandlers = ({
  selection,
  onDeleteClick,
  onCopyClick,
  clearSelection,
  elementRef
}: KeyboardHandlerProps) => {
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

    const element = elementRef.current
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
      return () => {
        element.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [selection, onDeleteClick, onCopyClick, clearSelection, elementRef])
}
