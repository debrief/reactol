import React, { useMemo } from 'react'
import { Feature } from 'geojson'
import { isVisible, featureFor } from './utils'

interface MapFeaturesProps {
  features: Feature[]
  onClickHandler: (id: string, modifier: boolean) => void
}

export const MapFeatures: React.FC<MapFeaturesProps> = ({ features, onClickHandler }) => {
  const visibleFeatures = useMemo(() => {
    const vis = features.filter(feature => isVisible(feature))
    return vis.map((feature: Feature) => featureFor(feature, onClickHandler)).filter(Boolean)
  }, [features, onClickHandler])

  return <>{visibleFeatures}</>
}
