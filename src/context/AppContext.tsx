import React, { createContext, useState, useContext } from 'react';

interface AppContextProps {
  selection: string[];
  setSelection: React.Dispatch<React.SetStateAction<string[]>>;
  time: [number, number, number];
  setTime: React.Dispatch<React.SetStateAction<[number, number, number]>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);
  const [time, setTime] = useState<[number, number, number]>([0, 0, 0]);

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
