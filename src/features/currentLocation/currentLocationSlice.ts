import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Feature } from 'geojson';

interface CurrentLocationState {
  locations: Feature[];
}

const initialState: CurrentLocationState = {
  locations: []
};

const currentLocationSlice = createSlice({
  name: 'currentLocation',
  initialState,
  reducers: {
    updateLocation(state, action: PayloadAction<Feature[]>) {
      state.locations = action.payload;
    }
  }
});

export const { updateLocation } = currentLocationSlice.actions;
export default currentLocationSlice.reducer;
