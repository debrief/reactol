import React, { createContext, useState, useContext } from 'react';
import { TimeState } from '../App';

interface AppContextProps {
  selection: string[];
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  time: TimeState;
  setTime: React.Dispatch<React.SetStateAction<TimeState>>;
  viewportFrozen: boolean
  setViewportFrozen:React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);
  const [viewportFrozen, setViewportFrozen] = useState(false);
  const [time, setTime] = useState<TimeState>({ filterApplied: false, start: 0,  step: '00h30m', end: 0 });
  return (
    <AppContext.Provider value={{ selection, setSelection, time, setTime, viewportFrozen, setViewportFrozen }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export { AppProvider, useAppContext };
