import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SelectionState {
  selected: string[]
}

const initialState: SelectionState = {
  selected: []
}


// Create the slice and pass in the initial state
const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectionChanged(_state, action: PayloadAction<SelectionState>) {
      return action.payload
    },
    addSelection(state, action: PayloadAction<string>) {
      const res = {selected: [...state.selected, action.payload]}
      return res
    },
    removeSelection(state, action: PayloadAction<string>) {
      const res = {selected: state.selected.filter((id) => id !== action.payload)}
      return res
    }
  }
})

// Export the generated reducer function
export default selectionSlice.reducer

