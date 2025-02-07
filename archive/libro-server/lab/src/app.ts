import * as path from 'path';
function initPublicPath() {
  const url = new URL((document.currentScript as HTMLScriptElement).src);
  const cdn = url.origin + path.join(url.pathname, '../');
  window.__webpack_public_path__ = cdn;
  window.publicPath = cdn;
  // @ts-ignore
  if (__webpack_require__) {
    // @ts-ignore
    __webpack_require__.p = cdn;
  }

  const el = document.getElementById('jupyter-config-data');
  if (el) {
    const pageConfig = JSON.parse(el.textContent || '') as Record<string, string>;
    const baseUrl = pageConfig['baseUrl'];
    if (baseUrl && baseUrl.startsWith('/')) {
      window.routerBase = baseUrl;
    }
  }
}

initPublicPath();
