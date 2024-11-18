import { Feature } from 'geojson';
import { TRACK_TYPE } from '../constants';

const track: Feature = {
  type: "Feature",
  properties: {
    dataType: TRACK_TYPE,
    color: '#F00',
    name: 'Track 1'
  },
  geometry: {
    coordinates: [
      [
        -6.27,
        35.82
      ],
      [
        -5.95,
        35.92
      ],
      [
        -5.12,
        35.95
      ],
      [
        -4.69,
        35.88
      ],
      [
        -4.21,
        35.8
      ],
      [
        -3.79,
        35.9
      ],
      [
        -3.4,
        35.98
      ],
      [
        -3.06,
        36.1
      ],
      [
        -2.58,
        36.26
      ],
      [
        -1.97,
        36.42
      ]
      
    ],
    type: "MultiPoint"
  }
}
export default track
