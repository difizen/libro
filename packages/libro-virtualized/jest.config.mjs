import configs from '../../jest.config.mjs';

delete configs.transformIgnorePatterns;
export default { ...configs };
