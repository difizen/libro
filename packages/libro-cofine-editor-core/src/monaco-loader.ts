import { inject, singleton } from '@difizen/libro-common/app';
import * as monaco from '@difizen/monaco-editor-core';

export const MonacoLoaderConfig = Symbol('MonacoLoaderConfig');
export interface MonacoLoaderConfig {
  requireConfig: {
    paths: {
      vs: string;
      [key: string]: string;
    };
  };
}

export const DefaultLoaderConfig: MonacoLoaderConfig = {
  requireConfig: {
    paths: {
      vs: 'https://unpkg.com/@difizen/monaco-editor-core@0.39.4/min/vs/',
    },
  },
};

@singleton()
export class MonacoLoader {
  loaded = false;
  protected start = false;
  protected vsRequire: any;
  protected readonly config;
  constructor(@inject(MonacoLoaderConfig) config: MonacoLoaderConfig) {
    this.config = config;
  }
  cdnUrl = '';

  async load(cdnUrl?: string) {
    if (cdnUrl) {
      this.cdnUrl = cdnUrl;
    }
    if (!this.start) {
      this.start = true;
      await this.doLoad();
    }
  }
  protected async doLoad(): Promise<void> {
    if (!this.loaded) {
      await this.initMonaco();
    }
  }
  // 初始化，将monaco挂在到window上
  initMonaco() {
    return new Promise((resolve, reject) => {
      if (this.cdnUrl) {
        const beforeExist = document.getElementById('e2-monaco-id');
        if (beforeExist) {
          if (window._Monaco) {
            const global: any = window;
            global.monaco = window._Monaco;
            this.loaded = true;
            resolve(true);
            return;
          }
          beforeExist.onload = () => {
            const global: any = window;
            global.monaco = window._Monaco;
            this.loaded = true;
            resolve(true);
          };
          return;
        }
        const script = document.createElement('script');
        script.id = 'e2-monaco-id';
        script.src = this.cdnUrl;
        // script.src =
        document.head.appendChild(script);
        script.onload = () => {
          const global: any = window;
          global.monaco = window._Monaco;
          this.loaded = true;
          resolve(true);
        };
        script.onerror = () => {
          document.head.removeChild(script);
          // 如果第一次失败的话，就再次加载monaco
          const script2 = document.createElement('script');
          script2.src = this.cdnUrl;
          document.head.appendChild(script2);
          script2.onload = () => {
            const global: any = window;
            global.monaco = window._Monaco;
            this.loaded = true;
            resolve(true);
          };
        };
      } else {
        const global: any = window;
        global.monaco = monaco;
        this.loaded = true;
        resolve(true);
      }
    });
  }
}
