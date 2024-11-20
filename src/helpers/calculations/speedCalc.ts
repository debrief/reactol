import { Calculation } from "../../components/GraphModal";
import { Feature } from 'geojson'

export const speedCalc: Calculation = {
  label: 'Speed',
  value: 'speed',
  isRelative: false,
  calculate:(_features: Feature[]): number[][] => {
    return [[10, 100], [20, 130], [30, 115]]
  },
}