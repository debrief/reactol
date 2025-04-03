import { createContext } from 'react'
import { OptionType } from './featureUtils'

export interface GraphsContextType {
  // State values
  showDepth: boolean
  showLegend: boolean
  filterForTime: boolean
  primaryTrack: string
  secondaryTracks: string[]
  isTransferModalVisible: boolean
  showTooltip: boolean
  primaryTrackOptions: OptionType[]
  
  // State setters
  setShowDepth: (show: boolean) => void
  setShowLegend: (show: boolean) => void
  setFilterForTime: (filter: boolean) => void
  setPrimaryTrack: (trackId: string) => void
  setSecondaryTracks: (tracks: string[]) => void
  setIsTransferModalVisible: (isVisible: boolean) => void
  setShowTooltip: (show: boolean) => void
}

export const GraphsContext = createContext<GraphsContextType | undefined>(undefined)

// The provider is now in GraphsContextProvider.tsx
// The hook is now in useGraphsContext.ts
