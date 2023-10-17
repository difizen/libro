const isString = function (x: any) {
  return typeof x === 'string';
};

// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts: string[], allowAboveRoot: boolean) {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    // ignore empty parts
    if (!p || p === '.') {
      continue;
    }

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

// posix version
const isAbsolute = function (path: string) {
  return path.charAt(0) === '/';
};

// path.normalize(path)
// posix version
const normalize = function (source: string) {
  let path = source;
  const isAbs = isAbsolute(path),
    trailingSlash = path.substr(-1) === '/';

  // Normalize the path
  path = normalizeArray(path.split('/'), !isAbs).join('/');

  if (!path && !isAbs) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbs ? '/' : '') + path;
};

// posix version
export const join = function (...args: string[]) {
  let path = '';
  for (let i = 0; i < args.length; i++) {
    const segment = args[i];
    if (!isString(segment)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }
  return normalize(path);
};
