const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'ts'],
  verbose: true,
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.ts?$',
  transform: {
    '^.+\\.(ts|tsx)?$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  coveragePathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
    '/mock/',
    '/docs/',
    '/scripts/mock/',
  ],
  collectCoverageFrom: ['**/*/src/**/*.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules', 'lib', 'es', 'dist'],
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'json-summary', 'json', 'lcov'],
};
