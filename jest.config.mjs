import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

import { defaults } from 'jest-config';

const swcJestConfig = {
  sourceMaps: false,
  jsc: {
    parser: {
      syntax: 'typescript',
      tsx: true,
      decorators: true,
    },

    transform: {
      react: {
        runtime: 'automatic',
      },
    },
  },
};

const configs = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'ts', 'tsx'],
  verbose: true,
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$',
  resolver: `${__dirname}/scripts/jest-resolver.cjs`,
  transform: {
    '^.+\\.(ts|tsx)?$': ['@swc/jest', swcJestConfig],
    '^.+\\.(js|jsx)$': ['@swc/jest', swcJestConfig],
  },
  transformIgnorePatterns: [
    '^/node_modules/(?!react-dnd|dnd-core|query-string|lodash-es|@react-dnd)',
  ],
  maxWorkers: process.env.JEST_MAX_WORKER || '100%',
  coveragePathIgnorePatterns: [
    '/dist/',
    '/lib/',
    '/es/',
    '/node_modules/',
    '/mock/',
    '/docs/',
    '/scripts/mock/',
  ],
  collectCoverageFrom: ['**/*/src/**/*.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules', 'src', 'es'],
  moduleNameMapper: {
    '\\.(less|css)$': 'jest-less-loader',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  coverageReporters: ['text-summary', 'json-summary', 'json', 'lcov'],
};

export default configs;
