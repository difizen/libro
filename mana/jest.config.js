const { defaults } = require('jest-config');

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'ts', 'tsx'],
  verbose: true,
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$',
  transform: {
    '^.+\\.(ts|tsx)?$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  coveragePathIgnorePatterns: [
    '/lib/',
    '/es/',
    '/node_modules/',
    '/mock/',
    '/docs/',
    '/scripts/mock/',
  ],
  collectCoverageFrom: [
    'packages/**/*/src/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{js,jsx,ts,tsx}',
  ],
  moduleDirectories: ['node_modules', 'lib', 'es', 'dist'],
  moduleNameMapper: {
    '\\.(less|css)$': 'jest-less-loader',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'json-summary', 'json', 'lcov'],
};
