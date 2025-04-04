import { Feature } from 'geojson'
import { TreeDataBuilder, IconCreators } from '../TreeDataBuilder'
import { BUOY_FIELD_TYPE, ZONE_TYPE, REFERENCE_POINT_TYPE, TRACK_TYPE, BACKDROP_TYPE } from '../../../constants'
import { NODE_TRACKS, NODE_FIELDS, NODE_ZONES, NODE_POINTS, NODE_BACKDROPS } from '../constants'

// Mock the symbolOptions
jest.mock('../../../helpers/symbolTypes', () => ({
  symbolOptions: [
    { value: 'air', label: 'AIR' },
    { value: 'nav', label: 'NAV' },
    { value: 'sub', label: 'SUB' },
    { value: 'lnd', label: 'LND' },
    { value: 'unk', label: 'UNK' }
  ]
}))

// Mock the featureIsVisibleInPeriod function
jest.mock('../../../helpers/featureIsVisibleAtTime', () => ({
  featureIsVisibleInPeriod: jest.fn((feature) => {
    // Only make air tracks visible in the time period
    return feature.properties?.env === 'air'
  })
}))

// Create mock icon creators that return simple strings instead of React elements
const mockIconCreators: IconCreators = {
  createFolderIcon: () => 'folder-icon',
  createFeatureIcon: (dataType, color, environment) => 
    `feature-icon-${dataType}-${color || 'no-color'}-${environment || 'no-env'}`,
  createAddIcon: (key, title, handleAdd) => `add-icon-${key}-${title}-${!!handleAdd}`,
  createTitleElement: (title) => `title-${title}`
}

// Mock handleAdd function
const mockHandleAdd = jest.fn()

// Create a set of test features
const createMockFeature = (id: string, name: string, dataType: string, env?: string, color?: string): Feature => ({
  type: 'Feature',
  id,
  properties: {
    name,
    dataType,
    env,
    stroke: color,
    'marker-color': color,
    visible: true
  },
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  }
})

// Create test features
const mockFeatures: Feature[] = [
  // Track features
  createMockFeature('track1', 'Air Track 1', TRACK_TYPE, 'air', '#ff0000'),
  createMockFeature('track2', 'Nav Track 1', TRACK_TYPE, 'nav', '#00ff00'),
  createMockFeature('track3', 'Sub Track 1', TRACK_TYPE, 'sub', '#0000ff'),
  
  // Buoy field features
  createMockFeature('buoy1', 'Buoy Field 1', BUOY_FIELD_TYPE, undefined, '#ff00ff'),
  createMockFeature('buoy2', 'Buoy Field 2', BUOY_FIELD_TYPE, undefined, '#ffff00'),
  
  // Zone features
  createMockFeature('zone1', 'Zone 1', ZONE_TYPE, undefined, '#00ffff'),
  
  // Reference point features
  createMockFeature('point1', 'Reference Point 1', REFERENCE_POINT_TYPE, undefined, '#ff00ff'),
  
  // Backdrop features
  createMockFeature('backdrop1', 'Backdrop 1', BACKDROP_TYPE)
]

describe('TreeDataBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('buildTrackNode', () => {
    test('should build a track node with all environments', () => {
      const result = TreeDataBuilder.buildTrackNode(mockFeatures, mockHandleAdd, mockIconCreators, false)
      
      // Check the root node
      expect(result.title).toBe('Units')
      expect(result.key).toBe(NODE_TRACKS)
      expect(result.icon).toBe('folder-icon')
      expect(result.children).toHaveLength(5) // One for each environment
      
      // Check that all environments are included
      const environmentKeys = result.children?.map(child => child.key) || []
      expect(environmentKeys).toEqual(expect.arrayContaining(['air', 'nav', 'sub', 'lnd', 'unk']))
      
      // Check the air environment node
      const airNode = result.children?.find(child => child.key === 'air')
      expect(airNode).toBeDefined()
      expect(airNode?.title).toBe('AIR')
      expect(airNode?.children).toHaveLength(1) // One air track
      
      // Check the air track node
      const airTrackNode = airNode?.children?.[0]
      expect(airTrackNode?.title).toBe('Air Track 1')
      expect(airTrackNode?.key).toBe('track1')
      expect(airTrackNode?.icon).toContain('feature-icon-track')
      expect(airTrackNode?.icon).toContain('#ff0000')
      expect(airTrackNode?.icon).toContain('air')
    })
    
    test('should filter environments with no features when useTimeFilter is true', () => {
      // Create a subset of features with only one environment
      const limitedFeatures = mockFeatures.filter(f => 
        f.properties?.dataType !== TRACK_TYPE || f.properties?.env === 'air'
      )
      
      const result = TreeDataBuilder.buildTrackNode(limitedFeatures, mockHandleAdd, mockIconCreators, true)
      
      // Check that only environments with features are included
      const environmentsWithFeatures = result.children?.filter(env => !!env.children?.length) || []
      expect(environmentsWithFeatures).toHaveLength(1)
      expect(environmentsWithFeatures[0].key).toBe('air')
    })
    
    test('should handle empty features array', () => {
      const result = TreeDataBuilder.buildTrackNode([], mockHandleAdd, mockIconCreators, false)
      
      // Check the root node
      expect(result.title).toBe('Units')
      expect(result.key).toBe(NODE_TRACKS)
      expect(result.children).toHaveLength(5) // Still has all environments
      
      // Check that all environments have empty children arrays
      result.children?.forEach(envNode => {
        expect(envNode.children).toHaveLength(0)
      })
    })
  })

  describe('buildTypeNode', () => {
    test('should build a node for buoy fields', () => {
      const result = TreeDataBuilder.buildTypeNode(
        mockFeatures,
        'Buoy Fields',
        NODE_FIELDS,
        BUOY_FIELD_TYPE,
        mockHandleAdd,
        mockIconCreators,
        false,
      )
      
      // Check the node structure
      expect(result).not.toBeNull()
      expect(result?.title).toBe('title-Buoy Fields')
      expect(result?.key).toBe(NODE_FIELDS)
      expect(result?.children).toHaveLength(2) // Two buoy fields
      
      // Check the children
      const childTitles = result?.children?.map(child => child.title) || []
      expect(childTitles).toEqual(expect.arrayContaining(['Buoy Field 1', 'Buoy Field 2']))
      
      // Check that each child has an icon
      result?.children?.forEach(child => {
        expect(child.icon).toContain('feature-icon')
        expect(child.icon).toContain(BUOY_FIELD_TYPE)
      })
    })
    
    test('should build a node for zones', () => {
      const result = TreeDataBuilder.buildTypeNode(
        mockFeatures,
        'Zones',
        NODE_ZONES,
        ZONE_TYPE,
        mockHandleAdd,
        mockIconCreators,
        false
      )
      
      // Check the node structure
      expect(result).not.toBeNull()
      expect(result?.title).toBe('title-Zones')
      expect(result?.key).toBe(NODE_ZONES)
      expect(result?.children).toHaveLength(1) // One zone
      
      // Check the child
      expect(result?.children?.[0].title).toBe('Zone 1')
      expect(result?.children?.[0].key).toBe('zone1')
    })
    
    test('should return null when useTimeFilter is true and there are no matching features', () => {
      // Filter out all buoy fields
      const filteredFeatures = mockFeatures.filter(f => f.properties?.dataType !== BUOY_FIELD_TYPE)
      
      const result = TreeDataBuilder.buildTypeNode(
        filteredFeatures,
        'Buoy Fields',
        NODE_FIELDS,
        BUOY_FIELD_TYPE,
        mockHandleAdd,
        mockIconCreators,
        true // useTimeFilter = true
      )
      
      // Should return null since there are no buoy fields and useTimeFilter is true
      expect(result).toBeNull()
    })
    
    test('should still return a node when useTimeFilter is false and there are no matching features', () => {
      // Filter out all buoy fields
      const filteredFeatures = mockFeatures.filter(f => f.properties?.dataType !== BUOY_FIELD_TYPE)
      
      const result = TreeDataBuilder.buildTypeNode(
        filteredFeatures,
        'Buoy Fields',
        NODE_FIELDS,
        BUOY_FIELD_TYPE,
        mockHandleAdd,
        mockIconCreators,
        false // useTimeFilter = false
      )
      
      // Should return a node with no children
      expect(result).not.toBeNull()
      expect(result?.children).toHaveLength(0)
    })
  })

  describe('buildTreeModel', () => {
    test('should build a complete tree model with all node types', () => {
      const result = TreeDataBuilder.buildTreeModel(
        mockFeatures,
        mockHandleAdd,
        mockIconCreators,
        false,
        0,
        0,
        undefined
      )
      
      // Should return an array with 5 nodes (tracks, buoy fields, zones, reference points, backdrops)
      expect(result).toHaveLength(5)
      expect(result.every(node => node !== null)).toBe(true)
      
      // Check that each expected node type is present
      const nodeKeys = result.map(node => node?.key)
      expect(nodeKeys).toEqual(expect.arrayContaining([
        NODE_TRACKS,
        NODE_FIELDS,
        NODE_ZONES,
        NODE_POINTS,
        NODE_BACKDROPS
      ]))
    })
    
    test('should filter nodes when useTimeFilter is true and there are no matching features', () => {
      // Create a subset of features with no buoy fields
      const limitedFeatures = mockFeatures.filter(f => f.properties?.dataType !== BUOY_FIELD_TYPE)
      
      const result = TreeDataBuilder.buildTreeModel(
        limitedFeatures,
        mockHandleAdd,
        mockIconCreators,
        true, // useTimeFilter = true,
        0,
        0,
        undefined
      )
      
      // Should filter out the buoy fields node
      const nodeKeys = result.filter(node => node !== null).map(node => node?.key)
      expect(nodeKeys).not.toContain(NODE_FIELDS)
    })
    
    test('should apply time filtering when specified', () => {
      // Create features with time properties
      const featuresWithTime = mockFeatures.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          time: true // Add time property to all features
        }
      }))
      
      const result = TreeDataBuilder.buildTreeModel(
        featuresWithTime,
        mockHandleAdd,
        mockIconCreators,
        true, // useTimeFilter = true
        1000, // timeStart
        2000, // timeEnd
        undefined
      )
      
      // The tracks node should only have air tracks
      const tracksNode = result.find(node => node?.key === NODE_TRACKS)
      const environmentsWithFeatures = tracksNode?.children?.filter(env => !!env.children?.length) || []
      
      // Since our mock always returns true for air tracks, only the air environment should have features
      expect(environmentsWithFeatures.length).toBe(1)
      expect(environmentsWithFeatures[0].key).toBe('air')
      
      // Check that non-air environments have no features
      const nonAirEnvironments = tracksNode?.children?.filter(env => env.key !== 'air') || []
      nonAirEnvironments.forEach(env => {
        expect(env.children?.length).toBe(0)
      })
    })
    
    test('should apply custom icon to zones node when provided', () => {
      // Create a custom icon for zones
      const customZonesIcon = 'custom-zones-icon'
      
      const result = TreeDataBuilder.buildTreeModel(
        mockFeatures,
        mockHandleAdd,
        mockIconCreators,
        false,
        0,
        0,
        customZonesIcon
      )
      
      // Find the zones node
      const zonesNode = result.find(node => node?.key === NODE_ZONES)
      
      // Verify that the zones node has the custom icon
      expect(zonesNode).toBeDefined()
      expect(zonesNode?.icon).toBe(customZonesIcon)
      
      // Verify that other nodes don't have the custom icon
      const otherNodes = result.filter(node => node?.key !== NODE_ZONES)
      otherNodes.forEach(node => {
        expect(node?.icon).not.toBe(customZonesIcon)
      })
    })
  })
})
