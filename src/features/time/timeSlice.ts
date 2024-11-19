import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TimeState {
  limits: [number, number] | null
  current: number | null
}

const initialState: TimeState = {
  limits: null,
  current: null,
}


// Create the slice and pass in the initial state
const timeSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    limitsChanged(state, action: PayloadAction<[number, number]>) {
      state.limits = action.payload
    },
    timeChanged(state, action: PayloadAction<number>) {
      state.current = action.payload
    }
  }
})

// Export the generated reducer function
export default timeSlice.reducer

