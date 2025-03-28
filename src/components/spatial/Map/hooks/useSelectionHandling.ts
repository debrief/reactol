import { useCallback } from 'react'
import { useDocContext } from '../../../../state/DocContext'

export const useSelectionHandling = () => {
  const { selection, setSelection } = useDocContext()

  const onClickHandler = useCallback((id: string, modifier: boolean): void => {
    if (modifier) {
      // add/remove from selection
      if (selection.includes(id)) {
        setSelection(selection.filter((selectedId) => selectedId !== id))
      } else {
        setSelection([...selection, id])
      }
    } else {
      // just select this item
      setSelection([id])
    }
  }, [selection, setSelection])

  return {
    selection,
    onClickHandler
  }
}
