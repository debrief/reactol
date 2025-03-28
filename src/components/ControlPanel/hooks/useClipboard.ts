import { useMemo } from 'react'
import { useDocContext } from '../../../state/DocContext'

export const useClipboard = () => {
  const { viewportFrozen, copyMapToClipboard } = useDocContext()

  const copyTooltip = useMemo(() => {
    return viewportFrozen
      ? 'Copy snapshot of map to the clipboard'
      : 'Lock the viewport in order to take a snapshot of the map'
  }, [viewportFrozen])

  return {
    copyTooltip,
    copyMapToClipboard
  }
}
