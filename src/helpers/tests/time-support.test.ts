import { TimeSupport } from '../time-support';

describe('TimeSupport', () => {
  describe('parsePeriod', () => {
    it('should parse valid periods correctly', () => {
      expect(TimeSupport.parsePeriod('00h15m')).toBe(15 * 60 * 1000);
      expect(TimeSupport.parsePeriod('01h00m')).toBe(60 * 60 * 1000);
    });

    it('should throw an error for invalid periods', () => {
      expect(() => TimeSupport.parsePeriod('invalid')).toThrow('Invalid time format');
      expect(() => TimeSupport.parsePeriod('00h60m')).toThrow('Invalid time format');
    });
  });

  describe('roundDown', () => {
    it('should round down to the nearest interval', () => {
      const date = new Date('2024-11-14T10:25:00.000Z');
      const interval = 15 * 60 * 1000;
      const roundedDate = TimeSupport.roundDown(date, interval);
      expect(roundedDate.getTime()).toBe(new Date('2024-11-14T10:15:00.000Z').getTime());
    });
  });

  describe('roundUp', () => {
    it('should round up to the nearest interval', () => {
      const date = new Date('2024-11-14T10:25:00.000Z');
      const interval = 15 * 60 * 1000;
      const roundedDate = TimeSupport.roundUp(date, interval);
      expect(roundedDate.getTime()).toBe(new Date('2024-11-14T10:30:00.000Z').getTime());
    });
  });

  describe('increment', () => {
    it('should increment the date by the specified interval', () => {
      const date = new Date('2024-11-14T10:00:00.000Z');
      const interval = 15 * 60 * 1000;
      const incrementedDate = TimeSupport.increment(date, interval);
      expect(incrementedDate.getTime()).toBe(new Date('2024-11-14T10:15:00.000Z').getTime());
    });
  });

  describe('decrement', () => {
    it('should decrement the date by the specified interval', () => {
      const date = new Date('2024-11-14T10:00:00.000Z');
      const interval = 15 * 60 * 1000;
      const decrementedDate = TimeSupport.decrement(date, interval);
      expect(decrementedDate.getTime()).toBe(new Date('2024-11-14T09:45:00.000Z').getTime());
    });
  });
});
