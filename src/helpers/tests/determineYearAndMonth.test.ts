import { determineYearAndMonth } from '../loaders/loadOpRep'

describe('determineYearAndMonth', () => {
  it('should use same month when days are close', () => {
    const existingTimes = ['2024-03-15T13:00:00.000Z', '2024-03-16T14:00:00.000Z']
    const firstItem: [number, number, number] = [17, 13, 0] // day 17
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2024)
    expect(month).toBe(3) // Should stay in March
  })

  it('should increment month when new day is much less than earliest day', () => {
    const existingTimes = ['2024-03-20T13:00:00.000Z', '2024-03-25T14:00:00.000Z']
    const firstItem: [number, number, number] = [2, 13, 0] // day 2, should be next month
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2024)
    expect(month).toBe(4) // Should be April
  })

  it('should decrement month when new day is much greater than earliest day', () => {
    const existingTimes = ['2024-03-02T13:00:00.000Z', '2024-03-05T14:00:00.000Z']
    const firstItem: [number, number, number] = [25, 13, 0] // day 25, should be previous month
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2024)
    expect(month).toBe(2) // Should be February
  })

  it('should increment year when wrapping from December to January', () => {
    const existingTimes = ['2024-12-20T13:00:00.000Z', '2024-12-25T14:00:00.000Z']
    const firstItem: [number, number, number] = [5, 13, 0] // day 5, should be next year January
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2025)
    expect(month).toBe(1) // Should be January of next year
  })

  it('should decrement year when wrapping from January to December', () => {
    const existingTimes = ['2024-01-02T13:00:00.000Z', '2024-01-05T14:00:00.000Z']
    const firstItem: [number, number, number] = [25, 13, 0] // day 25, should be previous year December
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2023)
    expect(month).toBe(12) // Should be December of previous year
  })

  it('should handle exact 15 day difference for month increment', () => {
    const existingTimes = ['2024-03-20T13:00:00.000Z', '2024-03-25T14:00:00.000Z']
    const firstItem: [number, number, number] = [5, 13, 0] // exactly 15 days less than earliest
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2024)
    expect(month).toBe(4) // Should increment to April
  })

  it('should handle exact 15 day difference for month decrement', () => {
    const existingTimes = ['2024-03-05T13:00:00.000Z', '2024-03-10T14:00:00.000Z']
    const firstItem: [number, number, number] = [20, 13, 0] // exactly 15 days more than earliest
    
    const [year, month] = determineYearAndMonth(existingTimes, firstItem)
    
    expect(year).toBe(2024)
    expect(month).toBe(2) // Should decrement to February
  })
})
