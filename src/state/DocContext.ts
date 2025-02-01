import React, { createContext, useContext } from 'react'
import { TimeState } from '../components/Document'

interface DocContextProps {
  selection: string[]
  setSelection: React.Dispatch<React.SetStateAction<string[]>>
  time: TimeState
  setTime: React.Dispatch<React.SetStateAction<TimeState>>
  viewportFrozen: boolean
  copyMapToClipboard: () => Promise<void>
  setMapNode: (node: HTMLElement | null) => void
  setViewportFrozen:React.Dispatch<React.SetStateAction<boolean>>
}

export const DocContext = createContext<DocContextProps | undefined>(undefined)

export const useDocContext = () => {
  const context = useContext(DocContext)
  if (!context) {
    throw new Error('useDocContext must be used within an DocContextProvider')
  }
  return context
}
