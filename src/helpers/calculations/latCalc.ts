import { Calculation, GraphDatum } from "../../components/GraphModal";
import { Feature } from 'geojson'

export const latCalc: Calculation = {
  label: 'Latitude',
  value: 'lat',
  isRelative: false,
  calculate:(_features: Feature[]): GraphDatum[] => {
    return [
      {date: new Date(10000), value: 12},
      {date: new Date(20000), value: 13},
      {date: new Date(30000), value: 22},
      {date: new Date(40000), value: 42},
      {date: new Date(50000), value: 32},
    ]
  },
}