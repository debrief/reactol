import { Feature, MultiPoint } from 'geojson';
import { TRACK_TYPE } from '../constants';
const combineFeatures = (existingF: Feature[], newF: Feature[]): Feature[] => {
  const notInExisting = newF.filter((feature: Feature) => !existingF.find((feature2: Feature) => feature2.id === feature.id))
  // handle the existing ones
  const existingFeatures = newF.filter((feature: Feature) => existingF.find((feature2: Feature) => feature2.id === feature.id))
  const updatedFeatures = existingFeatures.map((feature: Feature): Feature => {
    const existing = existingF.find((feature2: Feature) => feature2.id === feature.id)
    // check they are of same geometry type
    if (existing?.geometry.type !== feature.geometry.type) {
      throw new Error('Cannot combine features of different geometry types')
    }
    switch(existing.geometry.type) {
      case 'MultiPoint': {
        const existingCoords = existing.geometry.coordinates as number[][]
        const newAsLine = feature as Feature<MultiPoint>
        const newCoords = newAsLine.geometry.coordinates as number[][]
        const combinedCoords = existingCoords.concat(newCoords)
        // check if it's of dataType track
        if (feature.properties?.dataType === TRACK_TYPE) {
          const existingTimes = existing.properties?.times as string[]
          const newTimes = feature.properties?.times as string[]
          const combinedTimes = existingTimes.concat(newTimes)
          // also extract courses
          const existingCourses = existing.properties?.courses as number[]
          const newCourses = feature.properties?.courses as number[]
          const combinedCourses = existingCourses.concat(newCourses)
          // and speeds
          const existingSpeeds = existing.properties?.speeds as number[]
          const newSpeeds = feature.properties?.speeds as number[]
          const combinedSpeeds = existingSpeeds.concat(newSpeeds)

          return {...existing, geometry: { ...existing.geometry, coordinates: combinedCoords}, 
            properties: { ...existing.properties, times: combinedTimes, courses: combinedCourses, speeds: combinedSpeeds}}
        }
        return {...existing, geometry: { ...existing.geometry, coordinates: combinedCoords}}
      }
      default:
        throw new Error('Cannot combined features of this type:' + existing.geometry.type)
    }
  })
  return notInExisting.concat(updatedFeatures)
}

export default combineFeatures