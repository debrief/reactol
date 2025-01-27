/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  moduleNameMapper: {
    '^leaflet$': '<rootDir>/src/mock/leaflet.js',
  },
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true
      },
    },
  },
};