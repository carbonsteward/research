const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/services/(.*)$": "<rootDir>/services/$1",
    "^@/utils/(.*)$": "<rootDir>/utils/$1",
    "^@/types/(.*)$": "<rootDir>/types/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "services/**/*.{js,jsx,ts,tsx}",
    "utils/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!app/globals.css",
    "!app/layout.tsx",
  ],
  coverageReporters: ["lcov", "text", "text-summary", "html"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  testMatch: [
    "<rootDir>/__tests__/unit/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}",
  ],
  maxWorkers: process.env.CI ? 2 : "50%",
  verbose: true,
  testTimeout: 10000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
