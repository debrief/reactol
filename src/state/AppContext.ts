import React, { createContext, useContext } from 'react'

interface AppContextProps {
  clipboardUpdated: boolean // toggle for each update
  setClipboardUpdated: React.Dispatch<React.SetStateAction<boolean>>
}

export const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}
