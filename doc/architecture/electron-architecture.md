# Electron architecture

## Status

Proposed

## Context

We're delivering a browser-based application via Electron.   But, there remains a convenience in being able to view/test the application via the browser.

So, we have to establish where the interface is between Electron content and browser content.

## Decision

The editing page for a single Serial (stored as GeoJSON FeatureCollection) will be the component viewed/tested via the web.

The handling of multiple documents in a tabbed browser will be handled at the Electron level

## Consequences

- it remains easy to review/demonstrate/learn the application via the Web
- we have a minimal layer of Electron-specific functionality.
