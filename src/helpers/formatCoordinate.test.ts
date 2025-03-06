import { formatCoordinate, formatNatoCoords } from './formatCoordinate'

describe('formatCoordinate', () => {
  it('formats zero coordinate', () => {
    expect(formatCoordinate(0, true, false, ' ')).toBe('0°')
    expect(formatCoordinate(0, false, false, ' ')).toBe('0°')
  })

  it('formats latitude with whole minutes', () => {
    expect(formatCoordinate(45.5, true, false, ' ')).toBe('45°30\'00" N')
    expect(formatCoordinate(-33.5, true, false, ' ')).toBe('33°30\'00" S')
  })

  it('formats longitude with full precision', () => {
    expect(formatCoordinate(153.0251, false, false, ' ')).toBe('153°01\'30" E')
    expect(formatCoordinate(-151.2093, false, false, ' ')).toBe('151°12\'33" W')
  })

  it('shortens coordinates when allowed and applicable', () => {
    expect(formatCoordinate(45.0, true, true, ' ')).toBe('45° N')
    expect(formatCoordinate(45.5, true, true, ' ')).toBe('45°30\' N')
    expect(formatCoordinate(45.5025, true, true, ' ')).toBe('45°30\'09" N')
  })

  it('uses custom space character', () => {
    expect(formatCoordinate(45.5025, true, false, '')).toBe('45°30\'09"N')
    expect(formatCoordinate(45.5025, true, false, '_')).toBe('45°30\'09"_N')
  })
})

describe('formatNatoCoords', () => {
  it('formats zero coordinate', () => {
    expect(formatNatoCoords(0, true, false, ' ')).toBe('0°')
    expect(formatNatoCoords(0, false, false, ' ')).toBe('0°')
  })

  it('formats latitude with decimal minutes', () => {
    expect(formatNatoCoords(45.5025, true, false, ' ')).toBe('45°30.15\' N')
    expect(formatNatoCoords(-33.8688, true, false, ' ')).toBe('33°52.13\' S')
  })

  it('challenging number', () => {
    expect(formatNatoCoords(5.1, true, false, ' ')).toBe('05°06.00\' N')
  })

  it('formats longitude with decimal minutes', () => {
    expect(formatNatoCoords(153.0251, false, false, ' ')).toBe('153°01.51\' E')
    expect(formatNatoCoords(-151.2093, false, false, ' ')).toBe('151°12.56\' W')
  })

  it('shortens coordinates when allowed and minutes are zero', () => {
    expect(formatNatoCoords(45.0, true, true, ' ')).toBe('45° N')
    expect(formatNatoCoords(45.5, true, true, ' ')).toBe('45°30\' N')
  })

  it('uses custom space character', () => {
    expect(formatNatoCoords(45.5025, true, false, '')).toBe('45°30.15\'N')
    expect(formatNatoCoords(45.5025, true, false, '_')).toBe('45°30.15\'_N')
  })
})
