import { Feature, Geometry } from 'geojson'
import { CIRCLE_SHAPE, POLYGON_SHAPE, RECTANGLE_SHAPE, SECTION_CIRCULAR_RING_SHAPE, ZONE_TYPE } from '../constants'
import { ZoneProps } from '../types'

const zones: Feature<Geometry, ZoneProps>[] = [
  {
    id: 'z-1',
    type: 'Feature',
    properties: {
      name: 'SAP 1-1',
      color: '#F00',
      visible: true,
      dataType: 'zone',
      time: '2024-11-14T19:10:00.000Z',
      timeEnd: '2024-11-15T04:10:00.000Z',
      specifics: {
        shapeType: CIRCLE_SHAPE,
        origin: [
          -3.5822505234375,
          36
        ],
        radiusM: 21000
      }
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [
            -3.5822505234375,
            36.2331786816867
          ],
          [
            -3.5593950158727528,
            36.23205586260016
          ],
          [
            -3.536759619339945,
            36.22869821870215
          ],
          [
            -3.514562325081455,
            36.22313808593887
          ],
          [
            -3.493016905175266,
            36.215429011428306
          ],
          [
            -3.4723308537930007,
            36.20564523777222
          ],
          [
            -3.452703388917615,
            36.19388098805926
          ],
          [
            -3.4343235337653235,
            36.18024955844516
          ],
          [
            -3.4173682963886933,
            36.16488222704881
          ],
          [
            -3.402000964992337,
            36.14792698967218
          ],
          [
            -3.3883695353782386,
            36.12954713451988
          ],
          [
            -3.3766052856652804,
            36.1099196696445
          ],
          [
            -3.366821512009191,
            36.089233618262234
          ],
          [
            -3.359112437498633,
            36.067688198356045
          ],
          [
            -3.3535523047353517,
            36.045490904097555
          ],
          [
            -3.3501946608373356,
            36.02285550756475
          ],
          [
            -3.3490718417507974,
            36
          ],
          [
            -3.3501946608373356,
            35.97714449243525
          ],
          [
            -3.3535523047353517,
            35.954509095902445
          ],
          [
            -3.359112437498633,
            35.932311801643955
          ],
          [
            -3.366821512009191,
            35.910766381737766
          ],
          [
            -3.3766052856652804,
            35.8900803303555
          ],
          [
            -3.3883695353782386,
            35.87045286548012
          ],
          [
            -3.402000964992337,
            35.85207301032782
          ],
          [
            -3.4173682963886933,
            35.83511777295119
          ],
          [
            -3.4343235337653235,
            35.81975044155484
          ],
          [
            -3.452703388917615,
            35.80611901194074
          ],
          [
            -3.4723308537930007,
            35.79435476222778
          ],
          [
            -3.493016905175266,
            35.784570988571694
          ],
          [
            -3.514562325081455,
            35.77686191406113
          ],
          [
            -3.536759619339945,
            35.77130178129785
          ],
          [
            -3.5593950158727528,
            35.76794413739984
          ],
          [
            -3.5822505234375,
            35.7668213183133
          ],
          [
            -3.6051060310022476,
            35.76794413739984
          ],
          [
            -3.6277414275350552,
            35.77130178129785
          ],
          [
            -3.6499387217935455,
            35.77686191406113
          ],
          [
            -3.671484141699734,
            35.784570988571694
          ],
          [
            -3.6921701930819997,
            35.79435476222778
          ],
          [
            -3.7117976579573853,
            35.80611901194074
          ],
          [
            -3.730177513109677,
            35.81975044155484
          ],
          [
            -3.747132750486307,
            35.83511777295119
          ],
          [
            -3.7625000818826635,
            35.85207301032782
          ],
          [
            -3.7761315114967617,
            35.87045286548012
          ],
          [
            -3.7878957612097195,
            35.8900803303555
          ],
          [
            -3.7976795348658094,
            35.910766381737766
          ],
          [
            -3.8053886093763674,
            35.932311801643955
          ],
          [
            -3.8109487421396486,
            35.954509095902445
          ],
          [
            -3.8143063860376647,
            35.97714449243525
          ],
          [
            -3.815429205124203,
            36
          ],
          [
            -3.8143063860376647,
            36.02285550756475
          ],
          [
            -3.8109487421396486,
            36.045490904097555
          ],
          [
            -3.8053886093763674,
            36.067688198356045
          ],
          [
            -3.7976795348658094,
            36.089233618262234
          ],
          [
            -3.78789576120972,
            36.1099196696445
          ],
          [
            -3.7761315114967617,
            36.12954713451988
          ],
          [
            -3.7625000818826635,
            36.14792698967218
          ],
          [
            -3.747132750486307,
            36.16488222704881
          ],
          [
            -3.730177513109677,
            36.18024955844516
          ],
          [
            -3.7117976579573853,
            36.19388098805926
          ],
          [
            -3.692170193082,
            36.20564523777222
          ],
          [
            -3.671484141699734,
            36.215429011428306
          ],
          [
            -3.6499387217935455,
            36.22313808593887
          ],
          [
            -3.6277414275350552,
            36.22869821870215
          ],
          [
            -3.6051060310022476,
            36.23205586260016
          ],
          [
            -3.5822505234375,
            36.2331786816867
          ],
          [
            -3.5822505234375,
            36.2331786816867
          ]
        ]
      ]
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
      time: '2024-11-14T18:10:00.000Z',
      specifics:{
        shapeType: POLYGON_SHAPE
      }
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
      visible: true,
      specifics:{
        shapeType: POLYGON_SHAPE
      }
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
      visible: true,
      specifics:{
        shapeType: RECTANGLE_SHAPE,
        topLeft: [-4.952818128566975,
          35.64425286391361],
        bottomRight: [-4.325115749820583,
          35.36124236611033]
      }
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
      visible: true,
      specifics:{
        shapeType: POLYGON_SHAPE
      }
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
  },
  {
    id: 'z-14',
    type: 'Feature',
    properties: {
      name: 'RING SECTOR ALPHA',
      color: '#a100e6',
      dataType: 'zone',
      visible: true,
      specifics: {
        shapeType: SECTION_CIRCULAR_RING_SHAPE,
        origin: [
          -4.929840087890624,
          36.06510752994823
        ],
        startAngle: 80,
        endAngle: 180,
        innerRadiusM: 10000,
        outerRadiusM: 25000
      }
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [
            -4.656237628032574,
            36.113351025609404
          ],
          [
            -4.6550238859137805,
            36.105872662660005
          ],
          [
            -4.654014510529271,
            36.09836398476924
          ],
          [
            -4.653210252499825,
            36.09083057575632
          ],
          [
            -4.652611709910945,
            36.08327803783167
          ],
          [
            -4.652219327868101,
            36.075711987430935
          ],
          [
            -4.652033398165721,
            36.0681380510383
          ],
          [
            -4.652054059070203,
            36.060561861002334
          ],
          [
            -4.652281295217088,
            36.05298905134755
          ],
          [
            -4.652714937622495,
            36.045425253584646
          ],
          [
            -4.653354663808774,
            36.03787609252261
          ],
          [
            -4.654199998044327,
            36.03034718208588
          ],
          [
            -4.655250311697377,
            36.02284412113956
          ],
          [
            -4.656504823703454,
            36.01537248932579
          ],
          [
            -4.65796260114623,
            36.00793784291447
          ],
          [
            -4.659622559951283,
            36.000545710671375
          ],
          [
            -4.661483465692269,
            35.99320158974663
          ],
          [
            -4.663543934508896,
            35.98591094158686
          ],
          [
            -4.665802434136034,
            35.97867918787367
          ],
          [
            -4.668257285043184,
            35.971511706491924
          ],
          [
            -4.670906661683457,
            35.964413827530436
          ],
          [
            -4.673748593851133,
            35.95739082931826
          ],
          [
            -4.676780968146818,
            35.95044793449946
          ],
          [
            -4.680001529549052,
            35.94359030614933
          ],
          [
            -4.683407883091267,
            35.936823043934865
          ],
          [
            -4.686997495642795,
            35.930151180322355
          ],
          [
            -4.69076769779263,
            35.923579676835075
          ],
          [
            -4.694715685834529,
            35.91711342036359
          ],
          [
            -4.698838523851988,
            35.91075721953167
          ],
          [
            -4.703133145901529,
            35.90451580112031
          ],
          [
            -4.707596358292691,
            35.89839380655274
          ],
          [
            -4.712224841963009,
            35.89239578844277
          ],
          [
            -4.717015154946231,
            35.88652620720926
          ],
          [
            -4.7219637349319346,
            35.88078942775916
          ],
          [
            -4.727066901914633,
            35.87518971624153
          ],
          [
            -4.732320860930409,
            35.869731236875026
          ],
          [
            -4.737721704879031,
            35.86441804885119
          ],
          [
            -4.743265417429467,
            35.85925410331584
          ],
          [
            -4.748947876006623,
            35.854243240430776
          ],
          [
            -4.754764854857091,
            35.849389186518096
          ],
          [
            -4.760712028191623,
            35.84469555128909
          ],
          [
            -4.766784973402007,
            35.84016582515988
          ],
          [
            -4.772979174349922,
            35.83580337665579
          ],
          [
            -4.779290024725372,
            35.83161144990635
          ],
          [
            -4.785712831472148,
            35.82759316223278
          ],
          [
            -4.792242818277829,
            35.82375150182983
          ],
          [
            -4.798875129125671,
            35.82008932554358
          ],
          [
            -4.805604831905778,
            35.816609356746966
          ],
          [
            -4.8124269220828655,
            35.81331418331455
          ],
          [
            -4.819336326417873,
            35.81020625569806
          ],
          [
            -4.826327906740671,
            35.807287885104074
          ],
          [
            -4.833396463771059,
            35.80456124177534
          ],
          [
            -4.8405367409852,
            35.80202835337685
          ],
          [
            -4.847743428524628,
            35.79969110348798
          ],
          [
            -4.855011167144923,
            35.79755123020176
          ],
          [
            -4.8623345522011014,
            35.795610324832374
          ],
          [
            -4.869708137666774,
            35.79386983073172
          ],
          [
            -4.877126440184081,
            35.792331042216134
          ],
          [
            -4.884583943141378,
            35.79099510360382
          ],
          [
            -4.892075100775663,
            35.78986300836389
          ],
          [
            -4.899594342296675,
            35.7889355983776
          ],
          [
            -4.907136076029604,
            35.78821356331226
          ],
          [
            -4.914694693573334,
            35.78769744010837
          ],
          [
            -4.922264573971124,
            35.78738761258031
          ],
          [
            -4.929840087890624,
            35.78728431113096
          ],
          [
            -4.929840087890624,
            35.95397824242132
          ],
          [
            -4.926809882322824,
            35.95401956300106
          ],
          [
            -4.923781930163708,
            35.954143494012285
          ],
          [
            -4.920758483146216,
            35.95434994329384
          ],
          [
            -4.917741789653045,
            35.95463875731998
          ],
          [
            -4.91473409304464,
            35.95500972131449
          ],
          [
            -4.911737629990926,
            35.95546255941046
          ],
          [
            -4.908754628808007,
            35.95599693485539
          ],
          [
            -4.905787307801084,
            35.95661245026163
          ],
          [
            -4.902837873614815,
            35.95730864790189
          ],
          [
            -4.899908519592343,
            35.95808501004964
          ],
          [
            -4.897001424144226,
            35.95894095936413
          ],
          [
            -4.894118749128454,
            35.95987585931967
          ],
          [
            -4.891262638242798,
            35.960889014679076
          ],
          [
            -4.888435215430643,
            35.961979672010564
          ],
          [
            -4.885638583301524,
            35.963147020248165
          ],
          [
            -4.882874821567521,
            35.96439019129476
          ],
          [
            -4.880145985496686,
            35.965708260667725
          ],
          [
            -4.877454104384642,
            35.96710024818637
          ],
          [
            -4.874801180045506,
            35.968565118700866
          ],
          [
            -4.872189185323234,
            35.97010178286205
          ],
          [
            -4.869620062624523,
            35.97170909793147
          ],
          [
            -4.867095722474343,
            35.973385868631254
          ],
          [
            -4.864618042095177,
            35.97513084803289
          ],
          [
            -4.862188864011024,
            35.976942738484574
          ],
          [
            -4.85980999467721,
            35.97882019257618
          ],
          [
            -4.857483203137024,
            35.980761814141246
          ],
          [
            -4.855210219706161,
            35.982766159295274
          ],
          [
            -4.852992734685987,
            35.98483173750942
          ],
          [
            -4.850832397106538,
            35.986957012718946
          ],
          [
            -4.848730813500228,
            35.98914040446555
          ],
          [
            -4.8466895467071485,
            35.9913802890726
          ],
          [
            -4.844710114712867,
            35.99367500085264
          ],
          [
            -4.842793989519578,
            35.996022833346046
          ],
          [
            -4.840942596051451,
            35.998422040590036
          ],
          [
            -4.839157311094986,
            36.000870838417065
          ],
          [
            -4.83743946227517,
            36.0033674057816
          ],
          [
            -4.835790327068186,
            36.005909886114374
          ],
          [
            -4.8342111318514265,
            36.008496388702966
          ],
          [
            -4.832703050991492,
            36.01112499009788
          ],
          [
            -4.831267205970881,
            36.01379373554288
          ],
          [
            -4.829904664553995,
            36.016500640428674
          ],
          [
            -4.828616439993102,
            36.01924369176872
          ],
          [
            -4.827403490274828,
            36.02202084969624
          ],
          [
            -4.826266717407757,
            36.02483004898111
          ],
          [
            -4.825206966751648,
            36.027669200565704
          ],
          [
            -4.824225026388788,
            36.03053619311841
          ],
          [
            -4.823321626537933,
            36.03342889460368
          ],
          [
            -4.822497439011282,
            36.03634515386759
          ],
          [
            -4.821753076714888,
            36.03928280223749
          ],
          [
            -4.8210890931928665,
            36.04223965513473
          ],
          [
            -4.820505982215756,
            36.04521351369925
          ],
          [
            -4.820004177413325,
            36.048202166424765
          ],
          [
            -4.819584051952106,
            36.05120339080329
          ],
          [
            -4.819245918257884,
            36.05421495497798
          ],
          [
            -4.818990027783372,
            36.05723461940279
          ],
          [
            -4.81881657082121,
            36.06026013850796
          ],
          [
            -4.8187256763624555,
            36.06328926236987
          ],
          [
            -4.818717412000663,
            36.06631973838426
          ],
          [
            -4.818791783881615,
            36.06934931294131
          ],
          [
            -4.8189487366987525,
            36.0723757331016
          ],
          [
            -4.819188153734304,
            36.075396748271466
          ],
          [
            -4.819509856946083,
            36.078410111876636
          ],
          [
            -4.8199136070998865,
            36.08141358303294
          ],
          [
            -4.820399103947405,
            36.0844049282127
          ],
          [
            -4.656237628032574,
            36.113351025609404
          ]
        ]
      ]
    }
  }
]

export default zones