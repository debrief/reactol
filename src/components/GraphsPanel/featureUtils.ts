import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { FeatureIcon } from '../Layers/FeatureIcon'
import React from 'react'

export type OptionType = {
  label: string
  value: string
  dataType: string
  icon: React.ReactNode
}

/**
 * Converts a GeoJSON feature to an option object for use in selectors
 */
export const featureAsOption = (feature: Feature<Geometry, GeoJsonProperties>): OptionType => {
  const icon = React.createElement(FeatureIcon, {
    dataType: feature.properties?.dataType,
    color: feature.properties?.stroke || feature.properties?.color || feature.properties?.['marker-color'],
    environment: feature.properties?.env
  })
  
  return {
    label: feature.properties?.shortName || feature.properties?.name || feature.id,
    value: feature.id as string,
    dataType: feature.properties?.dataType as string,
    icon
  }
}
