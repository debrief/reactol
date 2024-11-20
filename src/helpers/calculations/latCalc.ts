import { Calculation } from "../../components/GraphModal";
import { Feature } from 'geojson'

export const latCalc: Calculation = {
  label: 'Latitude',
  value: 'lat',
  isRelative: false,
  calculate:(_features: Feature[]): number[][] => {
    return [[10, 10], [20, 30], [30, 15]]
  },
}