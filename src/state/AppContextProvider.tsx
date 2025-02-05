import { useState } from 'react'
import { AppContext } from './AppContext'

interface Props {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<Props> = ({ children }) => {
  const [clipboardUpdated, setClipboardUpdated] = useState<boolean | null>(null)

  return (
    <AppContext.Provider value={{ clipboardUpdated, setClipboardUpdated }}>
      {children}
    </AppContext.Provider>
  )
}
