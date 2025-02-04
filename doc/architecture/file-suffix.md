# File suffix

## Status

Proposed

## Context

We have control over the file suffix used in this application.

Since we are using `GeoJSON FeatureCollection` as our unit of storage, we could use `.json` or `.geojson` suffixes.  This will highlight the fact that we are using an existing standard for file storage.

But, by introducing a custom suffix we can instruct the operating system to treat files of that type as being specifically for this application.

## Decision

Use `.alba` as the file suffix for all files related to this application.  Even when the snippet to be stored/transferred is a single feature, store that feature within a FeatureCollection object.

## Consequences

- We superficially hide the fact that we're working with GeoJSON files
- We can give the files a user-friendly icon and file-type descriptor
- We can associate `.alba` files with this application, so double-clicking on one opens it in this app - and we don't offer that integration to other (unrelated) `.geojson` files.

Warning - we may the system file dialog to save files in a particular format, or load files in a particuler format.  If we're doing this via file suffix, then the above strategy works. But, if we have to do it via `mime-type` (such as `application/json` then we should go with standard json suffixes.
