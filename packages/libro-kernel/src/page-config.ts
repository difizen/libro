import { isObject, URL } from '@difizen/libro-common';
import { isWeb } from '@difizen/libro-common/mana-app';

/**
 * page config data for the Jupyter application.
 */
let configData: Record<string, string> | null = null;

export class PageConfig {
  static defaultWorkspace = 'default';
  /**
   * Get a url-encoded item from `body.data` and decode it
   * We should never have any encoded URLs anywhere else in code
   * until we are building an actual request.
   */
  static getBodyData(key: string): string {
    if (typeof document === 'undefined' || !document.body) {
      return '';
    }
    const val = document.body.dataset[key];
    if (typeof val === 'undefined') {
      return '';
    }
    return decodeURIComponent(val);
  }
  static getOption(name: string): string {
    if (configData) {
      return configData[name] || PageConfig.getBodyData(name);
    }
    configData = Object.create(null);
    // Use script tag if available.
    if (isWeb) {
      const el = document.getElementById('jupyter-config-data');
      if (el) {
        configData = JSON.parse(el.textContent || '') as Record<string, string>;
      }
    }

    if (!isObject(configData)) {
      configData = Object.create(null);
    } else {
      for (const key in configData) {
        // PageConfig expects strings
        if (typeof configData[key] !== 'string') {
          configData[key] = JSON.stringify(configData[key]);
        }
      }
    }
    return configData![name] || PageConfig.getBodyData(name);
  }

  /**
   * Set global configuration data for the Jupyter application.
   *
   * @param name - The name of the configuration option.
   * @param value - The value to set the option to.
   *
   * @returns The last config value or an empty string if it doesn't exist.
   */
  static setOption(name: string, value: string): string {
    const last = PageConfig.getOption(name);

    configData![name] = value;
    return last;
  }

  /**
   * Get the base url for a Jupyter application, or the base url of the page.
   */
  static getBaseUrl(): string {
    return URL.normalize(PageConfig.getOption('baseUrl') || '/');
  }

  /**
   * Get the base websocket url for a Jupyter application, or an empty string.
   */
  static getWsUrl(baseUrl?: string): string {
    let wsUrl = PageConfig.getOption('wsUrl');
    if (!wsUrl) {
      baseUrl = baseUrl ? URL.normalize(baseUrl) : PageConfig.getBaseUrl();
      if (baseUrl.indexOf('http') !== 0) {
        return '';
      }
      wsUrl = 'ws' + baseUrl.slice(4);
    }
    return URL.normalize(wsUrl);
  }

  /**
   * Get the authorization token for a Jupyter application.
   */
  static getToken(): string {
    return PageConfig.getOption('token') || PageConfig.getBodyData('jupyterApiToken');
  }

  /**
   * Get the Notebook version info [major, minor, patch].
   */
  static getNotebookVersion(): [number, number, number] {
    const notebookVersion = PageConfig.getOption('notebookVersion');
    if (notebookVersion === '') {
      return [0, 0, 0];
    }
    return JSON.parse(notebookVersion);
  }
}
