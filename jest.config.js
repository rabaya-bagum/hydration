/** Logic tests (domain, stores, sync) run in plain Node with babel-preset-expo; native modules are mocked in tests/setup.ts. */
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }] },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
};
