# How to store styling of features

## Status

Agreed

## Context

We're using `GeoJSON` as our data storage format.  GeoJSON has mature support for spatial data, with other metadata stored in the `properties` dictionary
for each feature.

We'll be storing styling information for each feature.

Ideally, we would adhere to a standard for this, so that:
- our data is presented properly on other systems
- our system can propertly present data from other systems

## Decision

Adopt the SimpleStyle Spec, as detailed here: https://github.com/mapbox/simplestyle-spec

## Consequences

- Declare TS type data for the standard properties
- Ensure our feature type definitions include the relevant shape properties.
