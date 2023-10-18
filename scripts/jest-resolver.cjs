function getResolver() {
  try {
    return require('jest-resolve/build/defaultResolver').default;
  } catch (_) {
    return require('jest-resolve/build/default_resolver').default;
  }
}

const JAVASCRIPT_EXTENSION = /\.js$/i;

function resolverTSAndTSX(path, options) {
  const resolver = options.defaultResolver || getResolver();

  try {
    return resolver(path, options);
  } catch (error) {
    if (!JAVASCRIPT_EXTENSION.test(path)) {
      throw error;
    }

    try {
      return resolver(path.replace(JAVASCRIPT_EXTENSION, '.ts'), options);
    } catch (_) {
      return resolver(path.replace(JAVASCRIPT_EXTENSION, '.tsx'), options);
    }
  }
}

module.exports = resolverTSAndTSX;
