import { formatDistanceToNow } from 'date-fns'

/**
 * A utility class for time-related operations.
 */
export class TimeSupport {
  static formatDuration(duration: number): string {
    if (duration < 500) { // Less than half a second
      return 'just now'
    }
    
    // Create a Date object that is 'duration' milliseconds ago
    const date = new Date(Date.now() - duration)
    
    // Use date-fns to format the duration in a human-readable way
    return formatDistanceToNow(date, {
      addSuffix: true, // Adds 'ago' to the output
    })
  }
  /**
   * Parses a period string in the format `00h15m`, `01h00m` into milliseconds.
   * @param {string} period - The period string to parse.
   * @returns {number} - The period in milliseconds.
   * @throws {Error} - If the period string is in an invalid format.
   */
  static parsePeriod(period: string): number {
    const regex = /^(\d{2})h(\d{2})m$/
    const match = period.match(regex)
    if (!match) {
      throw new Error('Invalid time format')
    }
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    if (minutes >= 60) {
      throw new Error('Invalid time format')
    }
    return (hours * 60 + minutes) * 60 * 1000
  }

  /**
   * Rounds a date-time down to the nearest specified interval.
   * @param {Date} date - The date-time to round down.
   * @param {number} interval - The interval in milliseconds.
   * @returns {Date} - The rounded down date-time.
   */
  static roundDown(date: Date, interval: number): Date {
    const time = date.getTime()
    const roundedTime = time - (time % interval)
    return new Date(roundedTime)
  }

  /**
   * Rounds a date-time up to the nearest specified interval.
   * @param {Date} date - The date-time to round up.
   * @param {number} interval - The interval in milliseconds.
   * @returns {Date} - The rounded up date-time.
   */
  static roundUp(date: Date, interval: number): Date {
    const time = date.getTime()
    const roundedTime = time + (interval - (time % interval))
    return new Date(roundedTime)
  }

  /**
   * Increments a date-time by the specified interval.
   * @param {Date} date - The date-time to increment.
   * @param {number} interval - The interval in milliseconds.
   * @returns {Date} - The incremented date-time.
   */
  static increment(date: Date, interval: number): Date {
    const time = date.getTime()
    return new Date(time + interval)
  }

  /**
   * Decrements a date-time by the specified interval.
   * @param {Date} date - The date-time to decrement.
   * @param {number} interval - The interval in milliseconds.
   * @returns {Date} - The decremented date-time.
   */
  static decrement(date: Date, interval: number): Date {
    const time = date.getTime()
    return new Date(time - interval)
  }
}
