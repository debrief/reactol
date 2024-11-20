import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface SelectionState {
  selected: string[] | null
}

const initialState: SelectionState = {
  selected: null
}


// Create the slice and pass in the initial state
const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectionChanged(_state, action: PayloadAction<SelectionState>) {
      return action.payload
    }
  }
})

// Export the generated reducer function
export default selectionSlice.reducer

export const selectedFeaturesSelection = (state: RootState) =>
  state.featureCollection.features.filter(feature => state.selected.selected?.includes(feature.id as string))
