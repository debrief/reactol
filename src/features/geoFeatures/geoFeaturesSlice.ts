import { createSlice } from '@reduxjs/toolkit'
import { FeatureCollection } from 'geojson'

const initialState: FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

// Create the slice and pass in the initial state
const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {}
})

// Export the generated reducer function
export default featuresSlice.reducer