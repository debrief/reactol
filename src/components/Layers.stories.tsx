import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Provider } from 'react-redux';
import { AppProvider } from '../context/AppContext';
import { configureStore } from '@reduxjs/toolkit';
import Layers from './Layers'; 
import featuresReducer from '../features/geoFeatures/geoFeaturesSlice'; 
import mockFeatures from '../mock/features'

// Mock Redux store with initial state
const mockStore = configureStore({
  reducer: {
    featureCollection: featuresReducer,
  },
  preloadedState: {
    featureCollection: mockFeatures,
  },
});

// Custom decorator to wrap Layers component with necessary providers
const withProviders = (Story: React.ComponentType) => (
  <Provider store={mockStore}> 
    <AppProvider>
      <Story />
    </AppProvider>
  </Provider>
);

// Storybook metadata
export default {
  title: 'Components/Layers',
  component: Layers,
  decorators: [withProviders],  // Apply necessary providers (Redux and AppContext)
} as Meta<typeof Layers>;

const Template: StoryFn<typeof Layers> = (args) => <Layers {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  openGraph: () => alert('Graph opened!'),
};
