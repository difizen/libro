class ObservableConfigImpl {
  async = false;
  paused = false;
  protected excludeCheckers: any[] = [];

  exclude(checker: (obj: Record<string | number | symbol, any>) => boolean) {
    return !!this.excludeCheckers.push(checker);
  }
  shouldExclude(obj: Record<string | number | symbol, any>): boolean {
    return this.excludeCheckers.some((checker) => checker(obj));
  }
}

export const ObservableConfig = new ObservableConfigImpl();

ObservableConfig.exclude((obj) => Object.isFrozen(obj));
// Treat as react element
ObservableConfig.exclude((obj) => '$$typeof' in obj);
// Prototypes that can not be observable
ObservableConfig.exclude((obj) => obj instanceof Promise);
ObservableConfig.exclude((obj) => obj instanceof Element);
ObservableConfig.exclude((obj) => obj instanceof RegExp);
ObservableConfig.exclude((obj) => obj instanceof Date);
ObservableConfig.exclude((obj) => obj instanceof WeakMap);
ObservableConfig.exclude((obj) => obj instanceof Set);
ObservableConfig.exclude((obj) => obj instanceof Performance);
