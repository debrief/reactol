/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  // Only run tests in the src directory
  testMatch: [
    "<rootDir>/src/**/*.test.[jt]s?(x)",
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)"
  ],
  // Explicitly ignore tests in the Playwright e2e directory
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/tests/"
  ],
  moduleNameMapper: {
    '^leaflet$': '<rootDir>/src/mock/leaflet.js'
  },
  transform: {
    "^.+.tsx?$": ["ts-jest",{}]
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true
      }
    }
  }
}