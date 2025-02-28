import { Feature, GeoJsonProperties, Geometry, LineString } from 'geojson'
import { AppDispatch } from '../../state/store'
import { TRACK_TYPE } from '../../constants'
import { ExistingTrackProps, NewTrackProps, TrackProps } from '../../types'

interface OpRepData {
  dtg: string
  position: string
  course: string
  speed: string
  depth?: string
}

const parseOpRepLine = (line: string): OpRepData | null => {
  const cleanLine = line.trim()
  if (cleanLine.length === 0) {
    return null
  }
  const regex = /^(\d{6}Z)\/(\d{4}\.\d{2}[NS])–(\d{5}\.\d{2}[EW])\/(\d{1,3})\/(\d{1,2}\.?\d{0,2}?)\/(\d{1,3}|-)\/\//
  const match = cleanLine.match(regex)
  if (!match) {
    console.log('failed to match: [' + cleanLine + ']')
    return null
  }
  return {
    dtg: match[1],
    position: `${match[2]} ${match[3]}`,
    course: match[4],
    speed: match[5],
    depth: match[6] === '-' ? undefined : match[6],
  }
}

type TrackItems = {
  times: Array<[number, number, number]> // day, hour, minute
  courses: number[]
  speeds: number[]
  coordinates: number[][]
}

const extractTrackItems = (data: OpRepData[]): TrackItems => {
  const latStringToValue = (coord: string) => {
    const degrees = parseFloat(coord.slice(0, 2))
    const minutes = parseFloat(coord.slice(2))
    return degrees + minutes / 60
  }
  const longStringToValue = (coord: string) => {
    const degrees = parseFloat(coord.slice(0, 3))
    const minutes = parseFloat(coord.slice(3))
    return degrees + minutes / 60
  }
  const coordinates = data.map((item) => {
    const lat = latStringToValue(item.position.split(' ')[0])
    const lon = longStringToValue(item.position.split(' ')[1])
    if (item.depth !== undefined) {
      const depth = -parseFloat(item.depth)
      return [lon, lat, depth]
    } else {
      return [lon, lat]
    }
  })

  const times = data.map((item): [number, number, number] => {
    const day = parseInt(item.dtg.slice(0, 2), 10)
    const hour = parseInt(item.dtg.slice(2, 4), 10)
    const minute = parseInt(item.dtg.slice(4, 6), 10)
    return [day, hour, minute]
  })

  // return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString()


  const courses = data.map((item) => parseFloat(item.course))
  const speeds = data.map((item) => parseFloat(item.speed))

  return {
    times,
    courses,
    speeds,
    coordinates
  }
}

export const determineYearAndMonth = (existingTimes: string[], firstItem: [number, number, number]): [number, number] => {
  console.log('determine year and month', existingTimes, firstItem)
  const times = existingTimes.map((item) => new Date(item))
  const year = times[0].getFullYear()
  const month = times[0].getMonth() + 1
  return [year, month]
}

const addToExistingTrack = (data: OpRepData[], existingTrack: Feature<Geometry, TrackProps>): Feature<Geometry, TrackProps> => {

  const { times, courses, speeds, coordinates } = extractTrackItems(data)

  // sort out the year and month
  const [year, month] = determineYearAndMonth(existingTrack.properties.times, times[0])
  const dtgs = times.map((item) => new Date(Date.UTC(year, month - 1, item[0], item[1], item[2])).toISOString())
  
  // decide if we are pre-pending or appending data
  const appendValues = true

  // add this data to the existing track
  if (appendValues) {
    existingTrack.properties.times.push(...dtgs)
    if (existingTrack.properties.courses) { 
      existingTrack.properties.courses.push(...courses)
    }
    if (existingTrack.properties.speeds) {
      existingTrack.properties.speeds.push(...speeds)
    }
    const lineString: LineString = existingTrack.geometry as LineString
    lineString.coordinates.push(...coordinates)
  } else {
    existingTrack.properties.times.unshift(...dtgs)
    if (existingTrack.properties.courses) {
      existingTrack.properties.courses.unshift(...courses)      
    } 
    if (existingTrack.properties.speeds) {
      existingTrack.properties.speeds.unshift(...speeds)
    }
    const lineString: LineString = existingTrack.geometry as LineString
    lineString.coordinates.unshift(...coordinates)
  }
  const lineString: LineString = existingTrack.geometry as LineString
  if (appendValues) { 
    lineString.coordinates.push(...coordinates)
  } else {
    lineString.coordinates.unshift(...coordinates)
  }
  return existingTrack
}

const generateNewTrack = (data: OpRepData[], values: NewTrackProps): Feature<Geometry, TrackProps> => {

  const { times, courses, speeds, coordinates } = extractTrackItems(data)

  const dtgs = times.map((item) => new Date(Date.UTC(values.year, values.month - 1, item[0], item[1], item[2])).toISOString())

  const props: TrackProps = {
    dataType: TRACK_TYPE,
    stroke: values.stroke,
    name: values.name,
    shortName: values.shortName,
    visible: true,
    env: values.env,
    times: dtgs,
    courses,
    speeds,
    labelInterval: parseInt(values.labelInterval),
    symbolInterval: parseInt(values.symbolInterval)
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: props,
  }
}

export const loadOpRep = async (text: string, _features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, existingTrackDetails?: ExistingTrackProps, values?: NewTrackProps) => {

  const lines = text.split('\n')
  const data: OpRepData[] = []

  for (const line of lines) {
    const parsedLine = parseOpRepLine(line)
    if (parsedLine) {
      data.push(parsedLine)
    }
  }

  if (existingTrackDetails) {
    // find the feature for this track
    const existingTrack = _features.find((feature) => feature.id === existingTrackDetails.trackId)
    if (!existingTrack) {
      console.warn('Couldn\'t find existing track', existingTrackDetails.trackId)
      return
    }
    // add the new data to the existing track
    const res = addToExistingTrack(data, existingTrack as Feature<Geometry, TrackProps>)
    dispatch({ type: 'fColl/featureUpdated', payload: res })
  } else {
    if (!values || !values.year || !values.month || !values.name || !values.shortName || !values.env || !values.stroke) {
      return
    }  
    const newFeature = generateNewTrack(data, values)
    dispatch({ type: 'fColl/featureAdded', payload: newFeature }) 
  }

}
