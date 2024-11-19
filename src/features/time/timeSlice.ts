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
  name: 'time',
  initialState,
  reducers: {
    timeChanged(state, action: PayloadAction<[number, number, number]>) {
      state.limits = [action.payload[0], action.payload[2]]
      state.current = action.payload[1]
      return state
    }
  }
})

// Export the generated reducer function
export default timeSlice.reducer

