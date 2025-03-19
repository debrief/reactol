import React, { createContext, useContext } from 'react'

/** application-level context */
interface AppContextProps {
  clipboardUpdated: boolean | null // toggle for each update
  setClipboardUpdated: React.Dispatch<React.SetStateAction<boolean | null>> // null means un-used
  isDarkMode: boolean // true for dark mode, false for light mode
  toggleDarkMode: () => void // function to toggle dark mode
}

export const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}
