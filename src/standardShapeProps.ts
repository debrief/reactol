// standard set of styling properties, as 
// defined here: https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0

export type PointStyleProps = {
  // OPTIONAL: default "medium"
  // specify the size of the marker. sizes
  // can be different pixel sizes in different
  // implementations
  // Value must be one of
  // "small"
  // "medium"
  // "large"
  'marker-size'?: 'small' | 'medium' | 'large',

  // OPTIONAL: default ""
  // a symbol to position in the center of this icon
  // if not provided or "", no symbol is overlaid
  // and only the marker is shown
  // Allowed values include
  // - Icon ID
  // - An integer 0 through 9
  // - A lowercase character "a" through "z"
  'marker-symbol'?: string | number | null,

  // OPTIONAL: default "7e7e7e"
  // the marker's color
  //
  // value must follow COLOR RULES
  'marker-color'?: string,
}

export type LineStyleProps = {
  // OPTIONAL: default "555555"
  // the color of a line as part of a polygon, polyline, or
  // multigeometry
  //
  // value must follow COLOR RULES
  'stroke': string,

  // OPTIONAL: default 1.0
  // the opacity of the line component of a polygon, polyline, or
  // multigeometry
  //
  // value must be a floating point number greater than or equal to
  // zero and less or equal to than one
  'stroke-opacity'?: number,

  // OPTIONAL: default 2
  // the width of the line component of a polygon, polyline, or
  // multigeometry
  //
  // value must be a floating point number greater than or equal to 0
  'stroke-width'?: number,
}

export type PolygonStyleProps = LineStyleProps & {
  // OPTIONAL: default "555555"
  // the color of the interior of a polygon
  //
  // value must follow COLOR RULES
  'fill'?: string,

  // OPTIONAL: default 0.6
  // the opacity of the interior of a polygon. Implementations
  // may choose to set this to 0 for line features.
  //
  // value must be a floating point number greater than or equal to
  // zero and less or equal to than one
  'fill-opacity'?: number
}