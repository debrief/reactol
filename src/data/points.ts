import { Feature } from 'geojson';
import { REFERENCE_POINT_TYPE } from '../constants';

const points: Feature[] = [
  {
    type: "Feature",
    properties: {
      name: "Point Juliet",
      dataType: REFERENCE_POINT_TYPE
    },
    geometry: {
      coordinates: [
        -4.8936104075163485,
        36.21513817682367
      ],
      type: "Point"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Point Kilo",
      dataType: REFERENCE_POINT_TYPE
    },
    geometry: {
      coordinates: [
        -3.5247318661170937,
        36.58891965401024
      ],
      type: "Point"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Point Lima",
      dataType: REFERENCE_POINT_TYPE
    },
    geometry: {
      coordinates: [
        -4.0060650478869775,
        35.69294394874646
      ],
      type: "Point"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Point Mike",
      dataType: REFERENCE_POINT_TYPE
    },
    geometry: {
      coordinates: [
        -2.302065101137316,
        35.892217563281974
      ],
      type: "Point"
    }
  }
]

export default points