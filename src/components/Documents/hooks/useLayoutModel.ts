import { useMemo, useCallback } from 'react'
import { Model, Actions, DockLocation } from 'flexlayout-react'
import { TabWithPath } from '../index'

/**
 * Custom hook that manages the layout model for the flexlayout-react library.
 * 
 * This hook handles:
 * - Creating and initializing the layout model
 * - Adding new tabs to the layout
 * 
 * @returns An object containing the layout model and a function to add tabs to it
 */
export const useLayoutModel = () => {
  /**
   * Create the initial layout model with default configuration
   * The model is created with tabEnableClose set to true, allowing tabs to be closed
   */
  const layoutModel = useMemo(() => {
    const model = {
      global: { tabEnableClose: true },
      layout: {
        type: 'row',
        children: [ ],
      },
    }
    return Model.fromJson(model)
  }, [])

  /**
   * Adds a new tab to the layout model
   * 
   * @param newTab - The tab object containing key, label, and children to be added to the layout
   */
  const addTabToLayout = useCallback((newTab: TabWithPath) => {
    if (layoutModel) {
      const tabSetNode = layoutModel.getRoot().getChildren()[0]
    
      if (tabSetNode) {
        layoutModel.doAction(
          Actions.addNode(
            {
              type: 'tab',
              name: newTab.label,
              component: newTab.key, 
              id: newTab.key 
            },
            tabSetNode.getId(),
            DockLocation.CENTER,
            0
          )
        )
      }
    }
  }, [layoutModel])

  return {
    layoutModel,
    addTabToLayout
  }
}
