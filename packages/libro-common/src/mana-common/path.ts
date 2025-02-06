export class Path {
  static separator = '/';

  static isDrive(segment: string): boolean {
    return segment.endsWith(':');
  }

  /**
   * vscode-uri always normalizes drive letters to lower case:
   * https://github.com/Microsoft/vscode-uri/blob/b1d3221579f97f28a839b6f996d76fc45e9964d8/src/index.ts#L1025
   */
  static normalizeDrive(path: string): string {
    if (path.length > 3 && path[0] === '/' && path[2] === ':') {
      const code = path.charCodeAt(1);
      if (code >= 65 && code <= 90) {
        path = `/${path[1].toLowerCase()}:${path.substring(3)}`;
      }
      return path;
    }
    if (path.length > 2 && path[1] === ':') {
      const code = path.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        path = `${path[0].toLowerCase()}:${path.substring(2)}`;
      }
      if (path[0] !== '/') {
        path = `/${path}`;
      }
    }
    return path;
  }
  /**
   * Normalize path separator to use Path.separator
   * @param Path candidate to normalize
   * @returns Normalized string path
   */
  static normalizePathSeparator(path: string): string {
    return path.split(/[\\]/).join(Path.separator);
  }

  static normalizePath(path: string): string {
    return Path.normalizeDrive(Path.normalizePathSeparator(path));
  }

  readonly isAbsolute: boolean;

  get isRelative(): boolean {
    return !this.isAbsolute;
  }

  readonly isRoot: boolean;
  readonly isDrive: boolean;
  readonly root: Path | undefined;
  readonly base: string;
  readonly name: string;
  readonly ext: string;

  private _dir: Path | undefined;
  private readonly raw: string;

  /**
   * The raw should be normalized, meaning that only '/' is allowed as a path separator.
   */
  constructor(raw: string) {
    this.raw = Path.normalizePath(raw);
    const lastIndex = this.raw.lastIndexOf(Path.separator);
    this.isAbsolute = this.raw.indexOf(Path.separator) === 0;
    this.base = lastIndex === -1 ? this.raw : this.raw.substring(lastIndex + 1);
    this.isDrive = Path.isDrive(this.base);
    this.isRoot = this.isAbsolute && lastIndex === 0 && (!this.base || this.isDrive);
    this.root = Path.toRoot(this);

    const extIndex = this.base.lastIndexOf('.');
    this.name = extIndex === -1 ? this.base : this.base.substring(0, extIndex);
    this.ext = extIndex === -1 ? '' : this.base.substring(extIndex);
  }

  /**
   * Returns the parent directory if it exists (`hasDir === true`) or `this` otherwise.
   */
  get dir(): Path {
    if (this._dir === undefined) {
      this._dir = this.doGetDir();
    }
    return this._dir;
  }

  /**
   * Returns `true` if this has a parent directory, `false` otherwise.
   *
   * _This implementation returns `true` if and only if this is not the root dir and
   * there is a path separator in the raw path._
   */
  get hasDir(): boolean {
    return !this.isRoot && this.raw.lastIndexOf(Path.separator) !== -1;
  }

  protected doGetDir(): Path {
    if (!this.hasDir) {
      return this;
    }
    const lastIndex = this.raw.lastIndexOf(Path.separator);
    if (this.isAbsolute) {
      const firstIndex = this.raw.indexOf(Path.separator);
      if (firstIndex === lastIndex) {
        return new Path(this.raw.substr(0, firstIndex + 1));
      }
    }
    return new Path(this.raw.substr(0, lastIndex));
  }

  includes(path: Path): boolean {
    return !!Path.relative(this, path);
  }

  toString(): string {
    return this.raw;
  }

  static toRoot(path: Path): Path | undefined {
    // '/' -> '/'
    // '/c:' -> '/c:'
    if (path.isRoot) {
      return path;
    }

    // 'foo/bar' -> `undefined`
    if (path.isRelative) {
      return undefined;
    }

    const index = path.raw.indexOf(Path.separator, Path.separator.length);

    if (index === -1) {
      // '/foo/bar' -> '/'
      return new Path(Path.separator);
    }

    // '/c:/foo/bar' -> '/c:'
    // '/foo/bar' -> '/'
    return new Path(path.raw.substring(0, index)).root;
  }

  static join(path: Path, ...paths: string[]): Path {
    const relativePath = paths.filter((s) => !!s).join(Path.separator);
    if (!relativePath) {
      return path;
    }
    if (path.raw.endsWith(Path.separator)) {
      return new Path(path.raw + relativePath);
    }
    return new Path(path.raw + Path.separator + relativePath);
  }

  /**
   *
   * @param paths portions of a path
   * @returns a new Path if an absolute path can be computed from the segments passed in + this.raw
   * If no absolute path can be computed, returns undefined.
   *
   * Processes the path segments passed in from right to left (reverse order) concatenating until an
   * absolute path is found.
   */
  static resolve(path: Path, ...paths: string[]): Path | undefined {
    const segments = paths.slice().reverse(); // Don't mutate the caller's array.
    segments.push(path.raw);
    let result = new Path('');
    for (const segment of segments) {
      if (segment) {
        const next = Path.join(new Path(segment), result.raw);
        if (next.isAbsolute) {
          return Path.normalize(next);
        }
        result = next;
      }
    }
    return undefined;
  }

  static relative(base: Path, path: Path): Path | undefined {
    if (base.raw === path.raw) {
      return new Path('');
    }
    if (!base.raw || !path.raw) {
      return undefined;
    }
    const raw = base.base ? base.raw + Path.separator : base.raw;
    if (!path.raw.startsWith(raw)) {
      return undefined;
    }
    const relativePath = path.raw.substr(raw.length);
    return new Path(relativePath);
  }

  /*
   * return a normalized Path, resolving '..' and '.' segments
   */
  static normalize(path: Path): Path {
    const trailingSlash = path.raw.endsWith('/');
    const pathArray = path.toString().split('/');
    const resultArray: string[] = [];
    pathArray.forEach((value) => {
      if (!value || value === '.') {
        return;
      }
      if (value === '..') {
        if (resultArray.length && resultArray[resultArray.length - 1] !== '..') {
          resultArray.pop();
        } else if (path.isRelative) {
          resultArray.push('..');
        }
      } else {
        resultArray.push(value);
      }
    });
    if (resultArray.length === 0) {
      if (path.isRoot) {
        return new Path('/');
      } else {
        return new Path('.');
      }
    }
    return new Path(
      (path.isAbsolute ? '/' : '') + resultArray.join('/') + (trailingSlash ? '/' : ''),
    );
  }
}
