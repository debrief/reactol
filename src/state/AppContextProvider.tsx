import { useState, useEffect, useCallback } from 'react'
import { AppContext } from './AppContext'

interface Props {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<Props> = ({ children }) => {
  const [clipboardUpdated, setClipboardUpdated] = useState<boolean | null>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Initialize from localStorage if available
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode)
  }, [])

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    
    // Apply dark mode class to body element
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  return (
    <AppContext.Provider value={{ 
      clipboardUpdated, 
      setClipboardUpdated,
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </AppContext.Provider>
  )
}
