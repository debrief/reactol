import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { AppDispatch } from '../../state/store'
import { TRACK_TYPE } from '../../constants'
import { NewTrackProps, TrackProps } from '../../types'

interface OpRepData {
  dtg: string;
  position: string;
  course: string;
  speed: string;
  depth?: string;
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

const convertToGeoJson = (data: OpRepData[], values: NewTrackProps): Feature<Geometry, TrackProps> => {
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

  const times = data.map((item) => {
    const day = parseInt(item.dtg.slice(0, 2), 10)
    const hour = parseInt(item.dtg.slice(2, 4), 10)
    const minute = parseInt(item.dtg.slice(4, 6), 10)
    return new Date(Date.UTC(values.year, values.month - 1, day, hour, minute)).toISOString()
  })

  const courses = data.map((item) => parseFloat(item.course))
  const speeds = data.map((item) => parseFloat(item.speed))

  const props: TrackProps = {
    dataType: TRACK_TYPE,
    color: values.color,
    name: values.name,
    shortName: values.shortName,
    visible: true,
    symbol: values.symbol,
    times,
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

export const loadOpRep = async (text: string, _features: Feature<Geometry, GeoJsonProperties>[], dispatch: AppDispatch, values?: NewTrackProps) => {

  if (!values || !values.year || !values.month || !values.name || !values.shortName || !values.symbol || !values.color) {
    return
  }

  const lines = text.split('\n')
  const data: OpRepData[] = []

  for (const line of lines) {
    const parsedLine = parseOpRepLine(line)
    if (parsedLine) {
      data.push(parsedLine)
    }
  }

  const newFeature = convertToGeoJson(data, values)
  dispatch({ type: 'featureCollection/featureAdded', payload: newFeature })
}

