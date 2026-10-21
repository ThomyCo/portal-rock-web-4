module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/test/polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/scripts/**/*.test.ts'],
  transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.cjs'
  }
}
