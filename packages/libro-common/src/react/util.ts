import { defaultPrefixCls } from './constant';

export const getPrefixCls = (suffixCls?: string) => {
  return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
};
