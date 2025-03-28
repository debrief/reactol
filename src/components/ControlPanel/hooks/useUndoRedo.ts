import { useState, useMemo } from 'react'
import { useAppSelector } from '../state/hooks'

export const useUndoRedo = () => {
  const canUndo = useAppSelector(state => state.fColl.past.length > 0)
  const canRedo = useAppSelector(state => state.fColl.future.length > 0)
  const [undoModalVisible, setUndoModalVisible] = useState(false)

  const undoRedoTitle = useMemo(() => {
    if(canUndo && canRedo) {
      return 'Undo/Redo ...'
    } else if (canUndo) {
      return 'Undo ...'
    } else if (canRedo) {
      return 'Redo ...'
    } else {
      return null
    }
  }, [canUndo, canRedo])

  return {
    canUndo,
    canRedo,
    undoModalVisible,
    setUndoModalVisible,
    undoRedoTitle
  }
}
