# Electron architecture

## Status

Proposed

## Context

We're delivering a browser-based application via Electron.   But, there remains a convenience in being able to view/test the application via the browser.

So, we have to establish where the interface is between Electron content and browser content.

![App storage](https://github.com/user-attachments/assets/25515959-4349-46f1-a058-96c669928139)

The above diagram shows that we have one redux store and one AppContext for each document that is open.  The `store` gets passed down through the component tree - so it is quite possible to have one store per document.  The `AppContext` also gets passed down in this way.

There are warnings about creating a multi-tab document using react components - since all of the data is in memory, and there could be performance challenges from multiple tabs doing background processing. But, our memory usage is expected to be fairly small, and background tabs will require zero processing.  So, we may be able to benefit from the whole app being in react, accessing Electron file handlers when necessary.

## Decision

All of the UI will be in react.  There will be bare minimum electron native menus.

## Consequences

- it remains easy to review/demonstrate/learn the application via the Web
- we have a minimal layer of Electron-specific functionality.
