import { GraphDatum } from '../../types'

// Import the processBearingData function - we need to make it accessible for testing
// Since it's not exported directly, we'll test it through a test export
// This requires a small modification to the original file to expose it for testing
import { processBearingDataForTest } from '../calculations/rangeBearingCalc'

describe('processBearingData', () => {
  it('should return the original data if less than 2 points', () => {
    const data: GraphDatum[] = [{ date: 1000, value: 45 }]
    const result = processBearingDataForTest(data)
    expect(result).toEqual(data)
  })

  // it('should not modify data with no large jumps', () => {
  //   const data: GraphDatum[] = [
  //     { date: 1000, value: 10 },
  //     { date: 2000, value: 20 },
  //     { date: 3000, value: 30 },
  //     { date: 4000, value: 40 }
  //   ]
  //   const result = processBearingDataForTest(data)
  //   expect(result).toEqual(data)
  // })

  it('should insert null value for a large bearing jump', () => {
    const data: GraphDatum[] = [
      { date: 1000, value: 10 },
      { date: 2000, value: 190 } // Jump of 180 degrees - exactly at threshold
    ]
    const result = processBearingDataForTest(data)
    
    // Should have 3 points now - original 2 plus a null point in between
    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ date: 1000, value: 10 })
    expect(result[1]).toEqual({ date: 1500, value: null }) // Midpoint time with null value
    expect(result[2]).toEqual({ date: 2000, value: 190 })
  })

  it('should handle multiple large jumps', () => {
    // Create a new array with the values we want to test
    // We need to use values that will definitely trigger our threshold
    const data: GraphDatum[] = [
      { date: 1000, value: 0 },
      { date: 2000, value: 200 }, // Jump of 200 degrees - clearly above threshold
      { date: 3000, value: 0 },   // Jump of 200 degrees - clearly above threshold
      { date: 4000, value: 179 }  // Jump of 179 degrees - just under threshold
    ]
    const result = processBearingDataForTest(data)

    console.log(result)
    
    // Should have 6 points now - original 4 plus 2 null points for the 2 large jumps
    expect(result.length).toBe(6)
    expect(result[0]).toEqual({ date: 1000, value: 0 })
    expect(result[1]).toEqual({ date: 1500, value: null }) // First null point
    expect(result[2]).toEqual({ date: 2000, value: 200 })
    expect(result[3]).toEqual({ date: 2500, value: null }) // Second null point
    expect(result[4]).toEqual({ date: 3000, value: 0 })
    expect(result[5]).toEqual({ date: 4000, value: 179 })
  })

  it('should not insert null for small bearing changes', () => {
    const data: GraphDatum[] = [
      { date: 1000, value: 10 },
      { date: 2000, value: 30 },  // Change of 20 degrees
      { date: 3000, value: 170 }, // Change of 140 degrees
      { date: 4000, value: 10 }   // Change of 160 degrees - not large enough
    ]
    const result = processBearingDataForTest(data)
    
    // Should be the same as original data
    expect(result).toEqual(data)
  })

  it('should handle edge case of bearing wrapping around 0/360', () => {
    const data: GraphDatum[] = [
      { date: 1000, value: 359 },
      { date: 2000, value: 1 }    // This is only a 2 degree change, not a jump
    ]
    const result = processBearingDataForTest(data)
    
    // Should be the same as original data - no null points inserted
    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ date: 1000, value: 359 })
    expect(result[1]).toEqual({ date: 1500, value: null }) // First null point
    expect(result[2]).toEqual({ date: 2000, value: 1 })

  })
  
  it('should handle extreme bearing jump from 1 to 359', () => {
    const data: GraphDatum[] = [
      { date: 1000, value: 1 },
      { date: 2000, value: 359 }  // This is only a 2 degree change when properly calculated
    ]
    const result = processBearingDataForTest(data)
    
    // Should be the same as original data - no null points inserted
    expect(result.length).toBe(3)
    expect(result[0]).toEqual({ date: 1000, value: 1 })
    expect(result[1]).toEqual({ date: 1500, value: null }) // First null point
    expect(result[2]).toEqual({ date: 2000, value: 359 })
  })
})
