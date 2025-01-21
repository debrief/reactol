import React, { createContext, useState, useCallback, useContext } from 'react';
import { TimeState } from '../App';
import domToImage from 'dom-to-image';

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

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

const AppProvider: React.FC<Props> = ({ children }) => {
  const [selection, setSelection] = useState<string[]>([]);
  const [viewportFrozen, setViewportFrozen] = useState(false);
  const [time, setTime] = useState<TimeState>({ filterApplied: false, start: 0,  step: '00h30m', end: 0 });
  const [mapNode, setMapNode] = useState<HTMLElement | null>(null)

  const copyMapToClipboard = useCallback(async () => {
    if (!mapNode) {
      console.warn('Map node is not registered yet.');
      return;
    }

    try {
      const width = mapNode.clientWidth
      const height = mapNode.clientHeight
      const imageBlob = await domToImage.toBlob(mapNode, { width, height })
      const clipboardItem = new ClipboardItem({ "image/png": imageBlob })
      await navigator.clipboard.write([clipboardItem])
    } catch (error) {
      console.error('Failed to copy map to clipboard:', error);
    }
  }, [mapNode]);

  return (
    <AppContext.Provider value={{ selection, setMapNode, setSelection, time, setTime, viewportFrozen, copyMapToClipboard, setViewportFrozen }}>
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
