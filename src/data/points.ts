import { Feature } from 'geojson';
import { REFERENCE_POINT_TYPE } from '../constants';

const points: Feature[] = [
  {
    type: "Feature",
    properties: {
      name: "SONO 1-1",
      dataType: REFERENCE_POINT_TYPE,
      color: "#FF0000",
      time: "2024-11-14T19:10:00.000Z",
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
      name: "SONO 1-2",
      dataType: REFERENCE_POINT_TYPE,
      color: "#00FF00",
      startTime: "2024-11-14T21:10:00.000Z",
      endTime: "2024-11-15T02:10:00.000Z"
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
      name: "NEW SONO",
      dataType: REFERENCE_POINT_TYPE,
      color: "#0000FF"
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
      name: "POINT D-1",
      dataType: REFERENCE_POINT_TYPE,
      color: "#FFFF00"
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
