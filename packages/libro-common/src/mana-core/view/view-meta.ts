import { getOrigin } from '@difizen/mana-observable';

import type { ManaContext } from '../module';

import type { View } from './view-protocol';
import { ViewContextMetaKey } from './view-protocol';

/**
 * View metadata
 * 提供静态方法，用于获取和设置视图的上下文
 */
export class ViewMeta {
  static setViewContext(view: View, context: ManaContext) {
    Reflect.defineMetadata(ViewContextMetaKey, getOrigin(context), getOrigin(view));
  }

  static getViewContext(view: View) {
    return Reflect.getMetadata(ViewContextMetaKey, getOrigin(view)) as ManaContext;
  }

  static removeViewContext(view: View) {
    Reflect.deleteMetadata(ViewContextMetaKey, getOrigin(view));
  }
}
