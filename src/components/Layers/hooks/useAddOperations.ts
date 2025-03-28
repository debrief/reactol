import { useCallback } from 'react'
import { EnvOptions } from '../../../types'
import { NODE_FIELDS, NODE_POINTS, NODE_TRACKS } from '../constants'

export const useAddOperations = (
  addBuoyField: () => void,
  addPoint: () => void,
  addBackdrop: () => void,
  setPendingTrackEnvironment: (env: EnvOptions | null) => void
) => {
  // Handle add operations based on node type
  const handleAdd = useCallback(
    (e: React.MouseEvent, key: string, title: string) => {
      if (key === NODE_TRACKS) {
        // special case - the environment is passed in title
        setPendingTrackEnvironment(title as EnvOptions)
      } else if (key === NODE_FIELDS) {
        addBuoyField()
      } else if (key === NODE_POINTS) {
        addPoint()
      } else if (key === 'node-backdrops') {
        addBackdrop()  
      } else {
        console.error(
          'unknown key for create new item ' + key + ' for ' + title
        )
      }
      e.stopPropagation()
    }, [addBuoyField, addPoint, addBackdrop, setPendingTrackEnvironment])

  return {
    handleAdd
  }
}
