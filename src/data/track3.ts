import { TRACK_TYPE } from "../constants";
import { calculateCoursesAndSpeeds } from '../helpers/trackCalculations';

const track = {
  type: "Feature",
  properties: {
    dataType: TRACK_TYPE,
    color: "#0F0",
    name: "Track 3",
    times: [
      "2024-11-14T16:17:00.000Z",
      "2024-11-14T16:18:00.000Z",
      "2024-11-14T16:19:00.000Z",
      "2024-11-14T16:20:00.000Z",
      "2024-11-14T16:21:00.000Z",
      "2024-11-14T16:22:00.000Z",
      "2024-11-14T16:23:00.000Z",
      "2024-11-14T16:24:00.000Z",
      "2024-11-14T16:25:00.000Z",
      "2024-11-14T16:26:00.000Z"
    ],
    courses: [
      45,
      30,
      15,
      0,
      -15,
      -30,
      -45,
      -60,
      -75
    ],
    speeds: [
      20,
      18,
      16,
      14,
      12,
      10,
      8,
      6,
      4
    ]
  },
  geometry: {
    coordinates: [
      [
        -6.831053175368908,
        35.51439803774424
      ],
      [
        -6.487274200987088,
        35.75032439406746
      ],
      [
        -6.289097397996954,
        35.90620624688029
      ],
      [
        -6.087308591843708,
        35.920396057792814
      ],
      [
        -5.630865383410367,
        35.970044620534836
      ],
      [
        -5.271457476407335,
        36.22321761657008
      ],
      [
        -4.922986961163758,
        36.38830674585246
      ],
      [
        -4.18183269928744,
        36.498488830827995
      ],
      [
        -3.371658785280829,
        36.52793856386866
      ],
      [
        -1.5817334164506178,
        36.470147067048856
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