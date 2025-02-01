import React, { createContext, useContext } from 'react'
import { TimeState } from '../components/Document'

export interface MessageStruct {
  title: string
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

interface DocContextProps {
  selection: string[]
  setSelection: React.Dispatch<React.SetStateAction<string[]>>
  time: TimeState
  setTime: React.Dispatch<React.SetStateAction<TimeState>>
  viewportFrozen: boolean
  copyMapToClipboard: () => Promise<void>
  setMapNode: (node: HTMLElement | null) => void
  setViewportFrozen:React.Dispatch<React.SetStateAction<boolean>>
  message: MessageStruct | null
  setMessage: React.Dispatch<React.SetStateAction<MessageStruct | null>>
}

export const DocContext = createContext<DocContextProps | undefined>(undefined)

export const useDocContext = () => {
  const context = useContext(DocContext)
  if (!context) {
    throw new Error('useDocContext must be used within an DocContextProvider')
  }
  return context
}
