import configs from '../../jest.config.mjs';

export default {
  ...configs,
  transformIgnorePatterns: ['^/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
};
