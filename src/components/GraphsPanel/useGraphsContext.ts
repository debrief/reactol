import { useContext } from 'react'
import { GraphsContext, GraphsContextType } from './GraphsContext'

// Custom hook to use the graphs context
export function useGraphsContext(): GraphsContextType {
  const context = useContext(GraphsContext)
  if (context === undefined) {
    throw new Error('useGraphsContext must be used within a GraphsProvider')
  }
  return context
}
