import React, { createContext, useState, useContext } from 'react';
import { TimeState } from '../App';

interface AppContextProps {
  selection: string[];
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  time: TimeState;
  setTime: React.Dispatch<React.SetStateAction<TimeState>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);
  const [time, setTime] = useState<TimeState>({ start: 0,  step: '00h30m', end: 0 });

  return (
    <AppContext.Provider value={{ selection, setSelection, time, setTime }}>
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
