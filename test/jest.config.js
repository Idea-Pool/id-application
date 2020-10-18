module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  logHeapUsage: true,
  reporters: ['default', 'jest-junit'],
  setupFilesAfterEnv: ['jest-expect-message', 'jest-allure/dist/setup', '<rootDir>/setup.ts']
};