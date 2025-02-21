import { Feature, LineString } from 'geojson'
import { TrackProps } from '../../types'
import { depthCalc } from '../calculations/depthCalc'

describe('depthCalc', () => {
  const mockTime = new Date('2024-11-14T16:16:53.662Z').getTime()
  
  const createMockTrack = (coordinates: number[][], times: string[] = [], name: string = 'test'): Feature<LineString, TrackProps> => ({
    type: 'Feature',
    id: name,
    properties: {
      name,
      shortName: name.substring(0, 4),
      stroke: '#F00',
      times,
      dataType: 'track',
      visible: true,
      env: 'air',
      labelInterval: 600000,
      symbolInterval: 60000
    },
    geometry: {
      type: 'LineString',
      coordinates
    }
  })

  it('should filter out tracks without depth values', () => {
    const trackNoDepth = createMockTrack([
      [-1.97, 36.42],
      [-2.0, 36.4]
    ], ['2024-11-14T16:16:53.662Z', '2024-11-14T16:17:53.662Z'])

    const result = depthCalc.calculate([trackNoDepth])
    expect(result).toHaveLength(0)
  })

  it('should include tracks with depth values', () => {
    const trackWithDepth = createMockTrack([
      [-1.97, 36.42, 100.0],
      [-2.0, 36.4, 100.0]
    ], ['2024-11-14T16:16:53.662Z', '2024-11-14T16:17:53.662Z'])

    const result = depthCalc.calculate([trackWithDepth])
    expect(result).toHaveLength(1)
  })

  it('should correctly extract depth values', () => {
    const trackWithDepth = createMockTrack([
      [-1.97, 36.42, 100.0],
      [-2.0, 36.4, 150.0]
    ], ['2024-11-14T16:16:53.662Z', '2024-11-14T16:17:53.662Z'])

    const result = depthCalc.calculate([trackWithDepth])
    expect(result[0].data).toHaveLength(2)
    expect(result[0].data[0].value).toBe(100.0)
    expect(result[0].data[1].value).toBe(150.0)
  })

  it('should format output correctly', () => {
    const trackWithDepth = createMockTrack([
      [-1.97, 36.42, 100.0]
    ], ['2024-11-14T16:16:53.662Z'], 'TestTrack')

    const result = depthCalc.calculate([trackWithDepth])
    expect(result[0]).toMatchObject({
      label: 'TestTrack  Depth',
      color: '#F00',
      featureName: 'TestTrack',
      data: [{
        date: mockTime,
        value: 100.0
      }]
    })
  })

  it('should handle multiple tracks', () => {
    const track1 = createMockTrack([
      [-1.97, 36.42, 100.0]
    ], ['2024-11-14T16:16:53.662Z'], 'Track1')

    const track2 = createMockTrack([
      [-2.0, 36.4, 150.0]
    ], ['2024-11-14T16:16:53.662Z'], 'Track2')

    const result = depthCalc.calculate([track1, track2])
    expect(result).toHaveLength(2)
    expect(result[0].featureName).toBe('Track1')
    expect(result[1].featureName).toBe('Track2')
  })
})
