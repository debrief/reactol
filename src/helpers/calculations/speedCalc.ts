import { Calculation, GraphDatum } from "../../components/GraphModal";
import { Feature } from 'geojson'

export const speedCalc: Calculation = {
  label: 'Speed',
  value: 'speed',
  isRelative: false,
  calculate:(_features: Feature[]): GraphDatum[] => {
      return [
        {date: new Date(10000), value: 32},
        {date: new Date(25000), value: 14},
        {date: new Date(30000), value: 25},
        {date: new Date(45000), value: 47},
        {date: new Date(50000), value: 12},
      ]  
  },
}