import { TRACK_TYPE } from "../constants";
import { calculateCoursesAndSpeeds } from '../helpers/trackCalculations';

const track = {
  type: "Feature",
  properties: {
    dataType: TRACK_TYPE,
    color: '#00F',
    name: 'Track 2',
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
        -6.26,
        35.53
      ],
      [
        -5.94,
        35.63
      ],
      [
        -5.11,
        35.66
      ],
      [
        -4.68,
        35.59
      ],
      [
        -4.2,
        35.51
      ],
      [
        -3.78,
        35.61
      ],
      [
        -3.39,
        35.69
      ],
      [
        -3.05,
        35.81
      ],
      [
        -2.57,
        35.97
      ],
      [
        -1.96,
        36.13
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
    times: []
  }
}

const { courses, speeds } = calculateCoursesAndSpeeds(track);
(track.properties as any).courses = courses;
(track.properties as any).speeds = speeds;

export default track;
