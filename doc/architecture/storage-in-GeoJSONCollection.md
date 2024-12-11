# Storage in GeoJSON FeatureCollection

## Status

Accepted
  
## Context

Users will load tracks and spatial data into a session. They will also make cosmetic and/or spatial edits to this data.  They will also add new data.

We need to allow them to store this data between sessions.

It could also be useful to have a strategy for in-browser storage of data.

## Decision

We are going to use a GeoJSON FeatureCollection as the structure to store sessions.  Significiantly, this format allows for a set of top level properties (which could in include spatial/temporal views/filters, some replay settings.  The structure also allows for an array of Spatial (GeoJSON)
 children.  The GeoJSON format does allow for an empty set of coordinates for a Feature - which gives an object with `id` and `properties` - allowing storage of a wide set of metadata.

## Consequences

- Datafiles can be transferred to partner agencies, and/or rendered in other software applications.
- Partner agencies can be encouraged to provide data in GeoJSON format, for easy loading.
