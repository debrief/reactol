import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { Provider } from 'react-redux'
import { DocContextProvider } from '../../state/DocContextProvider'
import { configureStore } from '@reduxjs/toolkit'
import Layers from '.././Layers'
import featuresReducer from '../../state/geoFeaturesSlice'
import { FeatureCollection } from 'geojson'
import mockFeatures from '../../mock/features'

// Custom function to create a mock store with dynamic features
const createMockStore = (features: FeatureCollection) =>
  configureStore({
    reducer: {
      fColl: featuresReducer,
    },
    preloadedState: {
      fColl:  features,
    },
  })

// Custom decorator to wrap Layers component with necessary providers
const withProviders = (features: FeatureCollection) => (Story: React.ComponentType) => (
  <Provider store={createMockStore(features)}> 
    <DocContextProvider>
      <Story />
    </DocContextProvider>
  </Provider>
)

// Storybook metadata
export default {
  title: 'Components/Layers',
  component: Layers,
} as Meta<typeof Layers>

const Template: StoryFn<typeof Layers> = (args) => <Layers {...args} />

// Default story
export const Default = Template.bind({})
Default.decorators = [withProviders(mockFeatures)]
Default.args = {
  openGraph: () => alert('Graph opened!'),
}

// Variant 1: Only Tracks
export const OnlyTracks = Template.bind({})
OnlyTracks.decorators = [
  withProviders(
    {
      ...mockFeatures,
      features: mockFeatures.features.filter((feature) => feature.properties?.dataType === 'track')
    }
  ),
]
OnlyTracks.args = {
  openGraph: () => console.log('Only tracks shown'),
}

// Variant 2: No Features Visible
export const NoVisibleFeatures = Template.bind({})
NoVisibleFeatures.decorators = [
  withProviders(
    {
      ...mockFeatures,
      features: mockFeatures.features.map((feature) => ({
        ...feature,
        properties: { ...feature.properties, visible: false },
      }))
    }
  ),
]

NoVisibleFeatures.args = {
  openGraph: () => console.log('No features visible'),
}

// Variant 3: All Features Visible
export const AllVisibleFeatures = Template.bind({})
AllVisibleFeatures.decorators = [
  withProviders(
    {
      ...mockFeatures,
      features: mockFeatures.features.map((feature) => ({
        ...feature,
        properties: { ...feature.properties, visible: true },
      }))
    }
  ),
]
AllVisibleFeatures.args = {
  openGraph: () => console.log('All features visible'),
}

// Variant 4: Only Points
export const OnlyPoints = Template.bind({})
OnlyPoints.decorators = [
  withProviders(
    {
      ...mockFeatures,
      features: mockFeatures.features.filter(
        (feature) => feature.properties?.dataType === 'reference_point'
      )
    }
  ),
]
OnlyPoints.args = {
  openGraph: () => console.log('Only points shown'),
}

// Variant 5: Mixed Selection
export const MixedSelection = Template.bind({})
MixedSelection.decorators = [
  withProviders(
    {
      ...mockFeatures,
      features: mockFeatures.features.map((feature, index) => ({
        ...feature,
        properties: { ...feature.properties, visible: index % 2 === 0 },
      }))
    }
  ),
]
MixedSelection.args = {
  openGraph: () => console.log('Mixed selection of features'),
}
