import type { ToolbarRegistry } from '@difizen/mana-app';
import {
  inject,
  ModalService,
  singleton,
  ToolbarContribution,
  useObserve,
} from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';

import { DocumentCommands, NotebookCommands } from '../command/index.js';
import { LibroService } from '../libro-service.js';

import { AllOutputsScrollIcon } from './all-outputs-scroll-icon.js';
import { ToolItemSelect } from './change-cell-to-selector.js';
import { HideAllSelect } from './hide-all-selector.js';
// import { RunSelect } from './run-selector';
import { SaveIcon } from './save-icon.js';
import { SideToolbarMoreSelect } from './side-toolar-more-select.js';
// import { SideToolbarRunSelect } from './side-toolbar-run-select';

function OutputsScorllTooltip({ libroService }: { libroService: LibroService }) {
  const service = useObserve(libroService);

  return (
    <div className="libro-tooltip">
      <span className="libro-tooltip-text">
        {l10n.t(
          service.active?.outputsScroll
            ? '取消固定 Output 展示高度'
            : '固定 Output 展示高度',
        )}
      </span>
    </div>
  );
}

@singleton({ contrib: [ToolbarContribution] })
export class LibroToolbarContribution implements ToolbarContribution {
  @inject(ModalService) protected readonly modalService: ModalService;
  @inject(LibroService) protected readonly libroService: LibroService;

  registerToolbarItems(registry: ToolbarRegistry): void {
    registry.registerItem({
      id: DocumentCommands['Save'].id,
      command: DocumentCommands['Save'].id,
      icon: SaveIcon,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('保存')}</span>
          <span className="libro-tooltip-keybind">Cmd + S</span>
        </div>
      ),

      group: ['group1'],
      order: '1',
    });
    registry.registerItem({
      id: NotebookCommands['Interrupt'].id,
      command: NotebookCommands['Interrupt'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('中断')}</span>
        </div>
      ),

      showLabelInline: true,
      group: ['group2'],
      order: 'b-all',
    });
    registry.registerItem({
      id: NotebookCommands['CloseAndShutdown'].id,
      command: NotebookCommands['CloseAndShutdown'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('关闭内核')}</span>
        </div>
      ),

      showLabelInline: true,
      group: ['group2'],
      order: 'b-all',
    });
    registry.registerItem({
      id: NotebookCommands['RestartClearOutput'].id,
      command: NotebookCommands['RestartClearOutput'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('重启并清空输出')}</span>
        </div>
      ),

      showLabelInline: true,
      group: ['group2'],
      order: 'c-all',
    });
    registry.registerItem({
      id: NotebookCommands['MoveCellUp'].id,
      command: NotebookCommands['MoveCellUp'].id,
      tooltip: (
        <div className="libro-side-tooltip">
          <span className="libro-tooltip-text">{l10n.t('上移')}</span>
          <span className="libro-tooltip-keybind">Up</span>
        </div>
      ),

      group: ['sidetoolbar1'],
      order: 'e',
    });
    registry.registerItem({
      id: NotebookCommands['MoveCellDown'].id,
      command: NotebookCommands['MoveCellDown'].id,
      tooltip: (
        <div className="libro-side-tooltip">
          <span className="libro-tooltip-text">{l10n.t('下移')}</span>
          <span className="libro-tooltip-keybind">Down</span>
        </div>
      ),

      group: ['sidetoolbar1'],
      order: 'f',
    });
    registry.registerItem({
      id: NotebookCommands['InsertCellBelow'].id,
      command: NotebookCommands['InsertCellBelow'].id,
      tooltip: (
        <div className="libro-side-tooltip">
          <span className="libro-tooltip-text">{l10n.t('增加')}</span>
          <span className="libro-tooltip-keybind">B</span>
        </div>
      ),

      group: ['sidetoolbar2'],
      order: 'g1',
    });
    registry.registerItem({
      id: NotebookCommands['DeleteCell'].id,
      command: NotebookCommands['DeleteCell'].id,
      tooltip: (
        <div className="libro-side-tooltip">
          <span className="libro-tooltip-text">{l10n.t('删除')}</span>
          <span className="libro-tooltip-keybind">D D</span>
        </div>
      ),

      group: ['sidetoolbar2'],
      order: 'g2',
    });
    registry.registerItem({
      id: NotebookCommands['UndoCellAction'].id,
      command: NotebookCommands['UndoCellAction'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('撤销')}</span>
          <span className="libro-tooltip-keybind">Z</span>
        </div>
      ),

      group: ['group3'],
      order: 'h1',
    });
    registry.registerItem({
      id: NotebookCommands['RedoCellAction'].id,
      command: NotebookCommands['RedoCellAction'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('重做')}</span>
          <span className="libro-tooltip-keybind">Shift + Z</span>
        </div>
      ),

      group: ['group3'],
      order: 'h2',
    });
    registry.registerItem({
      id: NotebookCommands['EnableOrDisableAllOutputScrolling'].id,
      command: NotebookCommands['EnableOrDisableAllOutputScrolling'].id,
      tooltip: <OutputsScorllTooltip libroService={this.libroService} />,
      group: ['group3'],
      order: 'h2',
      icon: AllOutputsScrollIcon,
    });
    registry.registerItem({
      id: NotebookCommands['HideAllCell'].id,
      command: NotebookCommands['HideAllCell'].id,
      icon: HideAllSelect,
      group: ['group3'],
      order: 'i',
    });
    registry.registerItem({
      id: NotebookCommands['ClearAllCellOutput'].id,
      command: NotebookCommands['ClearAllCellOutput'].id,
      tooltip: (
        <div className="libro-tooltip">
          <span className="libro-tooltip-text">{l10n.t('清空输出')}</span>
        </div>
      ),

      group: ['group3'],
      order: 'j',
    });
    registry.registerItem({
      id: NotebookCommands['ChangeCellTo'].id,
      icon: ToolItemSelect,
      command: NotebookCommands['ChangeCellTo'].id,
      group: ['group4'],
      order: 'k',
    });
    registry.registerItem({
      id: NotebookCommands['More'].id,
      icon: SideToolbarMoreSelect,
      command: NotebookCommands['More'].id,
      group: ['sidetoolbar3'],
      order: 'm',
    });
  }
}
