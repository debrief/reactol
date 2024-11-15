import { Feature } from 'geojson';
import { ZONE_TYPE } from '../constants';

const zones: Feature[] = [
  {
    type: "Feature",
    properties: {
      name: "Zone Alpha",
      color: "#F00",
      dataType: ZONE_TYPE
    },
    geometry: {
      coordinates: [
        [
          [
            -4.3348149616245735,
            36.59618279278054
          ],
          [
            -4.368613191708192,
            36.21103443054283
          ],
          [
            -3.7264425195973274,
            36.15286660993874
          ],
          [
            -3.697472423788696,
            36.57293534444898
          ],
          [
            -4.3348149616245735,
            36.57293534444898
          ],
          [
            -4.3348149616245735,
            36.59618279278054
          ]
        ]
      ],
      type: "Polygon"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Zone Bravo",
      color: "#F55",
      dataType: ZONE_TYPE
    },
    geometry: {
      coordinates: [
        [
          [
            -2.751090847135373,
            36.57263138675444
          ],
          [
            -2.751090847135373,
            36.26958241936657
          ],
          [
            -2.0268384519280573,
            36.26958241936657
          ],
          [
            -2.0268384519280573,
            36.57263138675444
          ],
          [
            -2.751090847135373,
            36.57263138675444
          ]
        ]
      ],
      type: "Polygon"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Zone Charlie",
      color: "#0FF",
      dataType: ZONE_TYPE
    },
    geometry: {
      coordinates: [
        [
          [
            -1.0708252902535094,
            36.38627965746993
          ],
          [
            -1.0708252902535094,
            35.98098129546909
          ],
          [
            -0.5010858706181125,
            35.98098129546909
          ],
          [
            -0.5010858706181125,
            36.38627965746993
          ],
          [
            -1.0708252902535094,
            36.38627965746993
          ]
        ]
      ],
      type: "Polygon"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Zone Delta",
      color: "#FF0",
      dataType: ZONE_TYPE
    },
    geometry: {
      coordinates: [
        [
          [
            -4.952818128566975,
            35.64425286391361
          ],
          [
            -4.952818128566975,
            35.36124236611033
          ],
          [
            -4.325115749820583,
            35.36124236611033
          ],
          [
            -4.325115749820583,
            35.64425286391361
          ],
          [
            -4.952818128566975,
            35.64425286391361
          ]
        ]
      ],
      type: "Polygon"
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Zone Echo",
      color: "#F0F",
      dataType: ZONE_TYPE
    },
    geometry: {
      coordinates: [
        [
          [
            -2.1910023281744486,
            35.25091466932183
          ],
          [
            -1.8530178770781447,
            35.51859385638275
          ],
          [
            -1.9882116575168425,
            35.56573908846066
          ],
          [
            -2.1137487393529852,
            35.62070682104229
          ],
          [
            -2.2392858211891564,
            35.62855627264446
          ],
          [
            -2.413106396038131,
            35.61285659888982
          ],
          [
            -2.528986779271719,
            35.52645331951457
          ],
          [
            -2.1910023281744486,
            35.25091466932183
          ]
        ]
      ],
      type: "Polygon"
    }
  }
]

export default zones