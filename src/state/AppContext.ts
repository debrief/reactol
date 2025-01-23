import React, { createContext, useContext } from 'react'
import { TimeState } from '../App'

interface AppContextProps {
  selection: string[];
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  time: TimeState;
  setTime: React.Dispatch<React.SetStateAction<TimeState>>;
  viewportFrozen: boolean;
  copyMapToClipboard: () => Promise<void>;
  setMapNode: (node: HTMLElement | null) => void;
  setViewportFrozen:React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
