import { Feature, Geometry } from 'geojson'
import { ZONE_TYPE } from '../constants'
import { ZoneProps } from '../types'

const zones: Feature<Geometry, ZoneProps>[] = [
  {
    id: 'z-1',
    type: 'Feature',
    properties: {
      name: 'SAP 1-1',
      color: '#F00',
      visible: true,
      dataType: ZONE_TYPE,
      time: '2024-11-14T19:10:00.000Z',
      timeEnd : '2024-11-15T04:10:00.000Z'
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
            36.59618279278054
          ]
        ]
      ],
      type: 'Polygon'
    }
  },
  {
    id: 'z-2',
    type: 'Feature',
    properties: {
      name: 'SAP 1-2',
      color: '#F55',
      dataType: ZONE_TYPE,
      visible: true,
      time: '2024-11-14T18:10:00.000Z'
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
      type: 'Polygon'
    }
  },
  {
    id: 'z-3',
    type: 'Feature',
    properties: {
      name: 'SAP 2',
      color: '#0FF',
      dataType: ZONE_TYPE,
      visible: true
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
      type: 'Polygon'
    }
  },
  {
    id: 'z-4',
    type: 'Feature',
    properties: {
      name: 'SIR 1',
      color: '#FF0',
      dataType: ZONE_TYPE,
      visible: true
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
      type: 'Polygon'
    }
  },
  {
    id: 'z-5',
    type: 'Feature',
    properties: {
      name: 'TRA 1',
      color: '#F0F',
      dataType: ZONE_TYPE,
      visible: true
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
      type: 'Polygon'
    }
  }
]

export default zones