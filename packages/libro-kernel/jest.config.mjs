import configs from '../../jest.config.mjs';

export default {
  ...configs,
  transformIgnorePatterns: ['^/node_modules/(?!query-string)'],
};
