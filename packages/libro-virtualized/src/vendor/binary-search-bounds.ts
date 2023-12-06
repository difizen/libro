/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-param-reassign */
// @ts-nocheck
/**
 * Binary Search Bounds
 * https://github.com/mikolalysenko/binary-search-bounds
 * Mikola Lysenko
 *
 * Inlined because of Content Security Policy issue caused by the use of `new Function(...)` syntax.
 * Issue reported here: https://github.com/mikolalysenko/binary-search-bounds/issues/5
 **/

function _GEA(a, l, h, y) {
  let i = h + 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (x >= y) {
      i = m;
      h = m - 1;
    } else {
      l = m + 1;
    }
  }
  return i;
}
function _GEP(a, l, h, y, c) {
  let i = h + 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (c(x, y) >= 0) {
      i = m;
      h = m - 1;
    } else {
      l = m + 1;
    }
  }
  return i;
}
function dispatchBsearchGE(a, y, c, l, h) {
  if (typeof c === 'function') {
    return _GEP(a, l === void 0 ? 0 : l | 0, h === void 0 ? a.length - 1 : h | 0, y, c);
  } else {
    return _GEA(a, c === void 0 ? 0 : c | 0, l === void 0 ? a.length - 1 : l | 0, y);
  }
}

function _GTA(a, l, h, y) {
  let i = h + 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (x > y) {
      i = m;
      h = m - 1;
    } else {
      l = m + 1;
    }
  }
  return i;
}
function _GTP(a, l, h, y, c) {
  let i = h + 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (c(x, y) > 0) {
      i = m;
      h = m - 1;
    } else {
      l = m + 1;
    }
  }
  return i;
}
function dispatchBsearchGT(a, y, c, l, h) {
  if (typeof c === 'function') {
    return _GTP(a, l === void 0 ? 0 : l | 0, h === void 0 ? a.length - 1 : h | 0, y, c);
  } else {
    return _GTA(a, c === void 0 ? 0 : c | 0, l === void 0 ? a.length - 1 : l | 0, y);
  }
}

function _LTA(a, l, h, y) {
  let i = l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (x < y) {
      i = m;
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return i;
}
function _LTP(a, l, h, y, c) {
  let i = l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (c(x, y) < 0) {
      i = m;
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return i;
}
function dispatchBsearchLT(a, y, c, l, h) {
  if (typeof c === 'function') {
    return _LTP(a, l === void 0 ? 0 : l | 0, h === void 0 ? a.length - 1 : h | 0, y, c);
  } else {
    return _LTA(a, c === void 0 ? 0 : c | 0, l === void 0 ? a.length - 1 : l | 0, y);
  }
}

function _LEA(a, l, h, y) {
  let i = l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (x <= y) {
      i = m;
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return i;
}
function _LEP(a, l, h, y, c) {
  let i = l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (c(x, y) <= 0) {
      i = m;
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return i;
}
function dispatchBsearchLE(a, y, c, l, h) {
  if (typeof c === 'function') {
    return _LEP(a, l === void 0 ? 0 : l | 0, h === void 0 ? a.length - 1 : h | 0, y, c);
  } else {
    return _LEA(a, c === void 0 ? 0 : c | 0, l === void 0 ? a.length - 1 : l | 0, y);
  }
}

function _EQA(a, l, h, y) {
  l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    if (x === y) {
      return m;
    } else if (x <= y) {
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return -1;
}
function _EQP(a, l, h, y, c) {
  l - 1;
  while (l <= h) {
    const m = (l + h) >>> 1,
      x = a[m];
    const p = c(x, y);
    if (p === 0) {
      return m;
    } else if (p <= 0) {
      l = m + 1;
    } else {
      h = m - 1;
    }
  }
  return -1;
}
function dispatchBsearchEQ(a, y, c, l, h) {
  if (typeof c === 'function') {
    return _EQP(a, l === void 0 ? 0 : l | 0, h === void 0 ? a.length - 1 : h | 0, y, c);
  } else {
    return _EQA(a, c === void 0 ? 0 : c | 0, l === void 0 ? a.length - 1 : l | 0, y);
  }
}

export default {
  ge: dispatchBsearchGE,
  gt: dispatchBsearchGT,
  lt: dispatchBsearchLT,
  le: dispatchBsearchLE,
  eq: dispatchBsearchEQ,
};
