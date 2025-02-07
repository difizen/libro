import type { CellView } from '@difizen/libro-core';
import {
  CellCollapsible,
  DefaultCollapseService,
  CollapseService,
} from '@difizen/libro-core';
import { prop } from '@difizen/libro-common/mana-app';
import { inject, transient } from '@difizen/libro-common/mana-app';

import { LibroTOCManager } from './toc-manager.js';
import { HeadingType } from './toc-protocol.js';

@transient({ token: CollapseService })
export class TOCCollapseService extends DefaultCollapseService {
  @inject(LibroTOCManager) libroTOCManager: LibroTOCManager;

  @prop()
  override collapserVisible = true;

  override setHeadingCollapse(cell: CellView, collapsing: boolean) {
    if (!CellCollapsible.is(cell)) {
      return;
    }
    cell.headingCollapsed = collapsing;
    const currentIndex = this.view.model.cells.findIndex(
      (item) => item.model.id === cell.model.id,
    );

    if (currentIndex < 0) {
      return;
    }

    const childNumber = this.getCollapsibleChildNumber(cell);
    cell.collapsibleChildNumber = childNumber;

    const childCells = this.view.model.cells.filter(
      (_item, index) => index > currentIndex && index <= currentIndex + childNumber,
    );
    if (collapsing === true) {
      childCells.forEach((item) => {
        item.collapsedHidden = collapsing;
      });
    } else {
      let i = 0;
      while (i < childNumber) {
        const element = childCells[i];
        element.collapsedHidden = false;
        /**
         * 展开时子项的折叠不需要展开
         */
        if (CellCollapsible.is(element) && element.headingCollapsed) {
          i = i + element.collapsibleChildNumber + 1;
        } else {
          i = i + 1;
        }
      }
    }
  }

  override getCollapsibleChildNumber(cell: CellView) {
    const providerList = this.libroTOCManager
      .getTOCProvider(this.view)
      .getCellTocProviderList();
    const withMaxLevel = providerList
      .map((item) => {
        let maxLevel = 100;
        if (item.tocProvider) {
          // 最大的标题是level最小的
          const headings = item.tocProvider
            ?.getHeadings()
            .filter((heading) => heading.type === HeadingType.Markdown);

          if (headings.length > 0) {
            maxLevel = Math.min(...headings.map((heading) => heading.level));
          }
        }
        return { ...item, maxLevel };
      })
      .map((item, index, array) => {
        let childNumber = 0;
        for (let i = index + 1; i < array.length; i++) {
          const element = array[i];
          if (item.maxLevel < element.maxLevel) {
            childNumber = childNumber + 1;
          } else {
            break;
          }
        }
        return { ...item, childNumber };
      });

    const number =
      withMaxLevel.find((item) => item.cellId === cell.model.id)?.childNumber ?? 0;
    return number;
  }
}
