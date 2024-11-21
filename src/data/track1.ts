import { Feature } from 'geojson';
import { TRACK_TYPE } from '../constants';
import { calculateCoursesAndSpeeds } from '../helpers/trackCalculations';

const track: Feature = {
  type: "Feature",
  properties: {
    dataType: TRACK_TYPE,
    color: '#F00',
    name: 'Track 1',
    times: [
      "2024-11-14T16:16:53.662Z",
      "2024-11-14T16:17:53.662Z",
      "2024-11-14T16:18:53.662Z",
      "2024-11-14T16:19:53.662Z",
      "2024-11-14T16:20:53.662Z",
      "2024-11-14T16:21:53.662Z",
      "2024-11-14T16:22:53.662Z",
      "2024-11-14T16:23:53.662Z",
      "2024-11-14T16:24:53.662Z",
      "2024-11-14T16:25:53.662Z"
    ]
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
    type: "MultiPoint"
  }
}

if (!track.properties) {
  track.properties = {
    dataType: 'track',
    color: '#f00',
    name: 'ALBA',
    times: [],
    courses: [],
    speeds: []
  }
}

const { courses, speeds } = calculateCoursesAndSpeeds(track);
(track.properties as any).courses = courses;
(track.properties as any).speeds = speeds;

export default track;
