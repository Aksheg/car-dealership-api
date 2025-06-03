module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  globalSetup: './jest.setup.ts',
  globalTeardown: './jest.teardown.ts',
  maxWorkers: 1,
  testTimeout: 30000,
  setupFilesAfterEnv: ['./jest.setupAfterEnv.ts']
};