import { transient, prop, inject } from '@difizen/libro-common/mana-app';

import type { NotebookModel } from './libro-protocol.js';
import { VirtualizedManagerOption } from './libro-protocol.js';

export interface IVirtualizedManager {
  openVirtualized: (length: number, size?: number, path?: string) => Promise<boolean>;
  isVirtualized: boolean;
}

@transient()
export class VirtualizedManager implements IVirtualizedManager {
  /**
   * 因为进行isVirtualized判断过后才会渲染list
   * 所以它用于滚动到某个cell的判断依据是没有问题的。
   */
  @prop()
  isVirtualized = false;

  libroModel: NotebookModel;

  constructor(
    @inject(VirtualizedManagerOption)
    virtualizedManagerOption: VirtualizedManagerOption,
  ) {
    this.libroModel = virtualizedManagerOption.libroModel;
  }

  /**
   *
   * @param length cell个数
   * @param size undefined 或者 单位 为B
   * @returns 是否使用虚拟滚动
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openVirtualized = async (length: number, size?: number, path?: string) => {
    this.isVirtualized = false;
    return false;
    // this.isVirtualized = true;
    // return true;
    // if (length > 100 || (size && size > 4)) {
    //   this.isVirtualized = true;
    //   return true;
    // } else {
    //   this.isVirtualized = false;
    //   return false;
    // }
  };
}
