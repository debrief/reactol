import { Feature } from 'geojson';
import { TRACK_TYPE } from '../constants';

const track: Feature = {
  type: 'Feature',
  properties: {
    dataType: TRACK_TYPE,
    color: '#F00',
    name: 'VAN GALEN',
    times: [
      "2024-11-14T16:16:53.662Z",
      "2024-11-14T18:16:53.662Z",
      "2024-11-14T20:16:53.662Z",
      "2024-11-14T22:16:53.662Z",
      "2024-11-15T00:16:53.662Z",
      "2024-11-15T02:16:53.662Z",
      "2024-11-15T04:16:53.662Z",
      "2024-11-15T06:16:53.662Z",
      "2024-11-15T08:16:53.662Z",
      "2024-11-15T10:16:53.662Z"
    ],
    courses: [
      252.1444002648299,
      247.7027788431718,
      246.51974075635033,
      255.89722958754757,
      253.75321749413487,
      281.758297866812,
      281.4912942489051,
      267.6875882837041,
      249.00534329704499,
      258.34646579037454
    ],
    speeds: [
      6.897450072808652,
      5.594994487778988,
      4.003923885317973,
      4.347747522443429,
      4.735925296595918,
      5.30236274345944,
      4.741287742427593,
      8.978975329464427,
      3.7096276991145738,
      6.3443015142895
    ],
    visible: true
  },
  geometry: {
    coordinates: [
      [
        -1.97,
        36.42
      ],
      [
        -2.58,
        36.26
      ],
      [
        -3.06,
        36.1
      ],
      [
        -3.4,
        35.98
      ],
      [
        -3.79,
        35.9
      ],
      [
        -4.21,
        35.8
      ],
      [
        -4.69,
        35.88
      ],
      [
        -5.12,
        35.95
      ],
      [
        -5.95,
        35.92
      ],
      [
        -6.27,
        35.82
      ]
    ],
    type: 'MultiPoint'
  },
  id: 'f-1'
}


export default track;
