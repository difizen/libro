// 从localstorage获取值
export const getPersist = (
  key = '',
  needParse = false,
  defaultVal: string | undefined = undefined,
) => {
  const jsonStr = window.localStorage.getItem(key) || defaultVal;
  if (!needParse) {
    return jsonStr;
  }
  try {
    if (!jsonStr) {
      return defaultVal;
    }
    return JSON.parse(jsonStr);
  } catch (ex) {
    return defaultVal;
  }
};

// 向localstorage更新值
export const setPersist = (key = '', val = '') => {
  window.localStorage.setItem(key, val);
};

export const removePersist = (key = '') => {
  window.localStorage.removeItem(key);
};
