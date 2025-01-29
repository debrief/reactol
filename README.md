# reactol
Technical demonstrator for creating maritime track replay app using React &amp; LeafletJS

[![Netlify Status](https://api.netlify.com/api/v1/badges/f360a63f-d4be-4d6b-9504-a7f3f6fc3216/deploy-status)](https://app.netlify.com/sites/reactol/deploys)

# Prerequisites

* Node.js (v16.x or newer recommended)
* yarn
* Electron
* Vite

# Scripts

Development

1. Run the Development Server

Start the Vite development server: `yarn dev`

2. Start Electron in Development Mode

Launch Electron in development mode: `yarn start-electron`

# Build

1. Build the Application

Compile TypeScript and bundle the application: `yarn run build`

2. Package Electron App

Package the Electron app for distribution: `yarn package-electron`

3. Make Installers for Electron

Create platform-specific installers: `yarn make-electron`

# Storybook

1. Launch Storybook to develop UI components in isolation: `yarn storybook `

2. Build Storybook

Generate a static version of Storybook for production: `yarn build-storybook`
