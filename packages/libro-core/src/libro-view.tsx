import { ToTopOutlined } from '@ant-design/icons';
import { concatMultilineString } from '@difizen/libro-common';
import {
  equals,
  useInject,
  inject,
  transient,
  BaseView,
  Slot,
  view,
  ViewInstance,
  ViewManager,
  ViewOption,
  Deferred,
  Disposable,
  DisposableCollection,
  Emitter,
  getOrigin,
  prop,
  watch,
  ConfigurationService,
  useConfigurationValue,
} from '@difizen/mana-app';
import { BackTop, Button, Spin } from 'antd';
import type { FC, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, memo, useCallback, useEffect, useRef } from 'react';
import { v4 } from 'uuid';

import {
  CellService,
  EditorCellView,
  ExecutableCellModel,
  ExecutableCellView,
} from './cell/index.js';
import type { LibroCellModel } from './cell/libro-cell-model.js';
import { CollapseServiceFactory } from './collapse-service.js';
import type { CollapseService } from './collapse-service.js';
import {
  CustomDragLayer,
  DndCellContainer,
  DndCellItemRender,
  DndContext,
  DndList,
  VirtualizedManager,
} from './components/index.js';
import { LibroViewHeader } from './components/libro-view-header.js';
import { LirboContextKey } from './libro-context-key.js';
import { LibroModel } from './libro-model.js';
import { NotebookService, notebookViewFactoryId } from './libro-protocol.js';
import type {
  CellOptions,
  CellView,
  DndContentProps,
  DndItemProps,
  NotebookView,
  NotebookModel,
  NotebookOption,
} from './libro-protocol.js';
import { LibroService } from './libro-service.js';
import {
  AutoInsertWhenNoCell,
  EnterEditModeWhenAddCell,
  HeaderToolbarVisible,
  RightContentFixed,
} from './libro-setting.js';
import { LibroSlotManager, LibroSlotView } from './slot/index.js';
import './index.less';

export const LibroContentComponent = memo(function LibroContentComponent() {
  const libroSlotManager = useInject(LibroSlotManager);
  const ref = useRef<HTMLDivElement | null>(null);
  const libroViewTopRef = useRef<HTMLDivElement>(null);
  const libroViewRightContentRef = useRef<HTMLDivElement>(null);
  const libroViewLeftContentRef = useRef<HTMLDivElement>(null);
  const libroViewContentRef = useRef<HTMLDivElement>(null);
  const instance = useInject<LibroView>(ViewInstance);
  const HeaderRender = getOrigin(instance.headerRender);
  const [headerVisible] = useConfigurationValue(HeaderToolbarVisible);
  const [rightContentFixed] = useConfigurationValue(RightContentFixed);

  const handleScroll = useCallback(() => {
    instance.cellScrollEmitter.fire();
    const cellRightToolbar = instance.container?.current?.getElementsByClassName(
      'libro-cell-right-toolbar',
    )[instance.model.activeIndex] as HTMLDivElement;
    const activeCellOffsetY =
      instance.activeCell?.container?.current?.getBoundingClientRect().y;
    const activeCellOffsetRight =
      instance.activeCell?.container?.current?.getBoundingClientRect().right;
    const activeOutput =
      ExecutableCellView.is(instance.activeCell) && instance.activeCell?.outputArea;
    const activeOutputOffsetBottom =
      activeOutput && activeOutput.length > 0
        ? activeOutput?.outputs[
            activeOutput.length - 1
          ].container?.current?.getBoundingClientRect().bottom
        : instance.activeCell?.container?.current?.getBoundingClientRect().bottom;
    const libroViewTopOffsetBottom =
      libroViewTopRef.current?.getBoundingClientRect().bottom;

    if (!cellRightToolbar) {
      return;
    }
    if (
      activeCellOffsetY !== undefined &&
      libroViewTopOffsetBottom !== undefined &&
      activeOutputOffsetBottom !== undefined &&
      activeCellOffsetY <= libroViewTopOffsetBottom + 12 &&
      activeOutputOffsetBottom >= libroViewTopOffsetBottom &&
      activeCellOffsetRight !== undefined
    ) {
      cellRightToolbar.style.cssText = `position:fixed;top:${
        libroViewTopOffsetBottom + 12
      }px;left:${activeCellOffsetRight + 44 - 34}px;right:unset;`;
    } else {
      cellRightToolbar.style.cssText = '  position: absolute;top: 0px;right: -44px;';
    }
  }, [instance]);

  useEffect(() => {
    if (
      rightContentFixed &&
      libroViewRightContentRef.current &&
      libroViewContentRef.current &&
      libroViewLeftContentRef.current
    ) {
      libroViewContentRef.current.style.cssText = 'display: block;';
      libroViewRightContentRef.current.style.cssText =
        'position: absolute;top:44px;right:20px';
      libroViewLeftContentRef.current.style.cssText = 'padding-right: 80px;';
    }
  }, [rightContentFixed]);

  return (
    <>
      {headerVisible && (
        <div className="libro-view-top" ref={libroViewTopRef}>
          <HeaderRender />
        </div>
      )}
      <div
        className="libro-view-content"
        onScroll={handleScroll}
        ref={libroViewContentRef}
      >
        <div className="libro-view-content-left" ref={libroViewLeftContentRef}>
          <DndContext>
            <CustomDragLayer />
            <DndList libroView={instance} ref={ref}>
              <Slot
                name={libroSlotManager.getSlotName(instance, 'list')}
                slotView={LibroSlotView}
              />
            </DndList>
          </DndContext>
        </div>
        <div className="libro-view-content-right" ref={libroViewRightContentRef}>
          {/* {tocVisible && instance.toc && <ViewRender view={instance.toc} />} */}
          <Slot
            name={libroSlotManager.getSlotName(instance, 'right')}
            slotView={LibroSlotView}
          />
        </div>
        <BackTop target={() => libroViewContentRef.current || document}>
          <div className="libro-totop-button">
            <Button shape="circle" icon={<ToTopOutlined />} />
          </div>
        </BackTop>
        <Slot
          name={libroSlotManager.getSlotName(instance, 'content')}
          slotView={LibroSlotView}
        />
      </div>
      <Slot
        name={libroSlotManager.getSlotName(instance, 'container')}
        slotView={LibroSlotView}
      />
    </>
  );
});

export const LibroRender = forwardRef<HTMLDivElement>(function LibroRender(props, ref) {
  const instance = useInject<LibroView>(ViewInstance);
  const libroService = useInject(LibroService);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.defaultPrevented) {
        return;
      }
      if (!instance.model.commandMode) {
        instance.enterCommandMode(true);
      }
    },
    [instance],
  );

  const handFocus = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!equals(libroService.active, instance)) {
        libroService.active = instance;
      }
      if (!equals(libroService.focus, instance)) {
        libroService.focus = instance;
      }
    },
    [instance, libroService],
  );

  const handBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (typeof ref === 'function') {
        return;
      }
      if (ref?.current?.contains(e.relatedTarget)) {
        const dndDom = ref?.current?.getElementsByClassName(
          'libro-dnd-cells-container',
        )[0];
        if (!dndDom?.contains(e.relatedTarget) && instance.model.readOnly) {
          instance.selectCell(undefined);
        }
      } else {
        instance.enterCommandMode(false);
        libroService.focus = undefined;
        instance.onBlurEmitter.fire('');
        if (instance.model.readOnly) {
          instance.selectCell(undefined);
        }
      }
    },
    [instance, libroService, ref],
  );

  return (
    <div
      className={`${instance.model.libroViewClass} libro-view`}
      onMouseDown={handleMouseDown}
      ref={ref}
      tabIndex={0}
      onFocus={handFocus}
      onBlur={handBlur}
    >
      <LibroContentComponent />
    </div>
  );
});

@transient()
@view(notebookViewFactoryId)
export class LibroView extends BaseView implements NotebookView {
  protected override toDispose = new DisposableCollection();
  model: NotebookModel;
  headerRender: FC<any> = LibroViewHeader;
  loadingRender: FC<any> = () => (
    <div className="libro-loading">
      <Spin />
    </div>
  );
  dndContentRender: FC<DndContentProps> = DndCellContainer;
  dndItemRender: ForwardRefExoticComponent<
    DndItemProps & RefAttributes<HTMLDivElement>
  > = DndCellItemRender;
  protected onCellCreateEmitter: Emitter<CellView> = new Emitter();
  get onCellCreate() {
    return this.onCellCreateEmitter.event;
  }

  onBlurEmitter: Emitter = new Emitter();
  get onBlur() {
    return this.onBlurEmitter.event;
  }

  @inject(CellService) cellService: CellService;
  @inject(LibroService) libroService: LibroService;
  @inject(LibroSlotManager) libroSlotManager: LibroSlotManager;
  @inject(LirboContextKey) contextKey: LirboContextKey;

  @inject(ViewManager) protected viewManager: ViewManager;
  @inject(ConfigurationService) protected configurationService: ConfigurationService;
  @inject(VirtualizedManager) virtualizedManager: VirtualizedManager;

  protected notebookService: NotebookService;
  protected collapseService: CollapseService;
  isDragging = false;

  @prop()
  collapserVisible = false;

  @prop()
  outputsScroll = false;

  get hasModal() {
    return this.model.cells.some((item) => item.hasModal);
  }

  @prop()
  saving?: boolean;

  onSaveEmitter: Emitter<boolean> = new Emitter();
  get onSave() {
    return this.onSaveEmitter.event;
  }

  runCellEmitter: Emitter<CellView> = new Emitter();
  get onRunCell() {
    return this.runCellEmitter.event;
  }

  cellScrollEmitter = new Emitter<void>();
  get onCellScroll() {
    return this.cellScrollEmitter.event;
  }

  protected initializedDefer = new Deferred<void>();

  get initialized() {
    return this.initializedDefer.promise;
  }

  constructor(
    @inject(ViewOption) options: NotebookOption,
    @inject(CollapseServiceFactory) collapseServiceFactory: CollapseServiceFactory,
    @inject(NotebookService) notebookService: NotebookService,
  ) {
    super();
    if (options.id) {
      this.id = options.id;
    }
    this.notebookService = notebookService;
    this.model = this.notebookService.getOrCreateModel(options);
    this.collapseService = collapseServiceFactory({ view: this });
    this.collapserVisible = this.collapseService.collapserVisible;

    this.initialize();
    this.initView();
  }

  initView() {
    // this.configurationService.get(TOCVisible).then(() => {
    //   this.viewManager.getOrCreateView(MarkdownCellTocView, { id: this.id }).then(toc => {
    //     this.toc = toc;
    //     toc.parent = this;
    //   });
    // });
    // this.viewManager
    //   .getOrCreateView(LibroKeybindInstrutionsView, { id: 'libro-keybind-instructions' })
    //   .then(keybindInstrutions => {
    //     this.keybindInstrutionsView = keybindInstrutions;
    //   });
  }

  async initialize() {
    this.model.isInitialized = false;
    const options = await this.model.initialize();
    this.configurationService
      .get(AutoInsertWhenNoCell)
      .then((value) => {
        const isAutoInsertWhenNoCell = value;
        if (isAutoInsertWhenNoCell && options.length === 0) {
          this.addCell(
            { id: v4(), cell: { cell_type: 'code', source: '', metadata: {} } },
            0,
          );
        }
        return;
      })
      .catch((e) => {
        //
      });
    await this.insertCells(options);
    // 第一次insert不需要历史
    setTimeout(() => {
      this.model.sharedModel.clearUndoHistory();
      // 未初始化完成不做渲染，防止重复渲染多次
      this.model.isInitialized = true;
      this.configurationService
        .get(EnterEditModeWhenAddCell)
        .then((value) => {
          if (value) {
            this.enterEditMode();
          } else {
            this.enterCommandMode(true);
          }
          return;
        })
        .catch((e) => {
          //
        });
      this.toDispose.push(
        watch(this.model, 'cells', () => {
          this.model.onChange?.();
          this.model.onSourceChange?.();
        }),
      );
      this.initializedDefer.resolve();
    }, 0);
  }

  override view = LibroRender;

  override onViewMount = () => {
    this.libroService.active = this;
    this.libroSlotManager.setup(this);

    // this.libroService.libroPerformanceStatistics.setRenderEnd(new Date());

    // console.log(
    //   '[performance] render Time: ',
    //   this.libroService.libroPerformanceStatistics.getRenderTime(),
    // );
  };

  override onViewUnmount = () => {
    if (equals(this.libroService.active, this)) {
      this.libroService.active = undefined;
    }
  };

  async getCellViewByOption(option: CellOptions) {
    const toDispose = new DisposableCollection();
    option.cell.metadata.trusted = this.model.trusted;
    const cellView = await this.cellService.getOrCreateView(option, this.id);
    cellView.parent = this;
    this.onCellCreateEmitter.fire(cellView);
    toDispose.push(
      Disposable.create(() => {
        this.deleteCell(cellView);
      }),
    );
    const disposable = cellView.onDisposed(() => {
      toDispose.dispose();
    });
    toDispose.push(disposable);
    return cellView;
  }

  focus = () => {
    if (this.container?.current?.contains(document.activeElement)) {
      return;
    }
    this.container?.current?.focus();
  };

  insertCells = async (options: CellOptions[], position?: number): Promise<void> => {
    const cellView = await Promise.all(
      options.map(async (option) => {
        const newView = await this.getCellViewByOption(option);
        return newView;
      }),
    );

    this.model.insertCells(cellView, position);
  };

  selectCell = (cell?: CellView) => {
    this.model.active = cell;
    this.model.selectCell(cell);
  };

  addCell = async (option: CellOptions, position?: number) => {
    const cellView = await this.getCellViewByOption(option);
    this.model.addCell(cellView, position);
  };

  addCellAbove = async (option: CellOptions, position?: number) => {
    const cellView = await this.getCellViewByOption(option);
    this.model.addCell(cellView, position, 'above');
  };

  get activeCell(): CellView | undefined {
    return this.model.active;
  }

  get activeCellIndex(): number {
    return this.model.activeIndex;
  }

  findCellIndex = (cell: CellView) => {
    const cellList = this.model.getCells();
    if (cell) {
      const cellIndex = cellList.findIndex((item) => {
        return item.id === cell.id;
      });
      return cellIndex;
    }
    return -1;
  };

  deleteCell = (cell: CellView) => {
    const deleteIndex = this.model.getCells().findIndex((item) => {
      return equals(item, cell);
    });
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      const startIndex = this.model.getCells().findIndex((item) => {
        return equals(item, this.model.selections[0]);
      });
      const endIndex = startIndex + this.model.selections.length;
      getOrigin(this.model.sharedModel).transact(() => {
        getOrigin(this.model.sharedModel).deleteCellRange(startIndex, endIndex);
      });
      this.configurationService
        .get(AutoInsertWhenNoCell)
        .then((value) => {
          const isAutoInsertWhenNoCell = value;
          if (isAutoInsertWhenNoCell && this.model.cells.length === 0) {
            this.addCell(
              { id: v4(), cell: { cell_type: 'code', source: '', metadata: {} } },
              0,
            );
          }
          return;
        })
        .catch((e) => {
          //
        });
    } else {
      if (deleteIndex > -1) {
        this.model.deletedCells.push(cell);
        this.model.deleteCell(cell.id);
        cell.isAttached = false;
      }
      this.configurationService
        .get(AutoInsertWhenNoCell)
        .then((value) => {
          const isAutoInsertWhenNoCell = value;
          if (isAutoInsertWhenNoCell && this.model.cells.length === 0) {
            this.addCell(
              { id: v4(), cell: { cell_type: 'code', source: '', metadata: {} } },
              0,
            );
          }
          return;
        })
        .catch((e) => {
          //
        });
    }
  };

  executeCellRun(cell: CellView) {
    this.runCellEmitter.fire(cell);
    return cell.run();
  }

  runCells = async (cells: CellView[]) => {
    if (this.model.canRun && !this.model.canRun()) {
      return false;
    }

    return Promise.all(
      cells.map((cell) => {
        if (ExecutableCellModel.is(cell.model)) {
          return this.executeCellRun(cell);
        }
        return undefined;
      }),
    )
      .then((resultList) => {
        return resultList.every((item) => !!item);
      })
      .catch((reason: any) => {
        if (reason.message.startsWith('KernelReplyNotOK')) {
          return undefined;
        } else {
          throw reason;
        }
      });
  };

  runAllCell = async () => {
    this.runCells(this.model.cells);
  };

  runAllAbove = async (cell: CellView) => {
    const index = this.findCellIndex(cell);
    this.runCells(this.model.cells.slice(0, index));
  };

  runAllBelow = async (cell: CellView) => {
    const index = this.findCellIndex(cell);
    this.runCells(this.model.cells.slice(index));
  };

  runCell = async (cell: CellView) => {
    this.enterCommandMode(true);
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      await this.runCells(this.model.selections);
    } else {
      await this.runCells([cell]);
    }
  };

  runCellandSelectNext = async (cell: CellView) => {
    this.enterCommandMode(true);
    this.collapseCell(cell, false);
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      const toRunCells = this.model.selections;
      const selectIndex = this.findCellIndex(
        this.model.selections[this.model.selections.length - 1],
      );
      if (selectIndex >= 0 && selectIndex < this.model.cells.length - 1) {
        this.model.selectCell(this.model.cells[selectIndex + 1]);
      }
      if (selectIndex === this.model.cells.length - 1) {
        this.addCell(
          { id: v4(), cell: { cell_type: cell.model.type, source: '', metadata: {} } },
          selectIndex + 1,
        )
          .then(() => {
            this.enterEditMode();
            return;
          })
          .catch((e) => {
            //
          });
      }
      this.runCells(toRunCells);
    } else {
      const selectIndex = this.findCellIndex(cell);
      if (selectIndex >= 0 && selectIndex < this.model.cells.length - 1) {
        this.model.selectCell(this.model.cells[selectIndex + 1]);
      }
      if (selectIndex === this.model.cells.length - 1) {
        this.addCell(
          { id: v4(), cell: { cell_type: cell.model.type, source: '', metadata: {} } },
          selectIndex + 1,
        )
          .then(() => {
            this.enterEditMode();
            return;
          })
          .catch((e) => {
            //
          });
      }
      this.runCells([cell]);
    }
    if (this.virtualizedManager.isVirtualized) {
      setTimeout(() => {
        if (this.activeCell) {
          this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
        }
      });
    } else {
      setTimeout(() => {
        if (this.activeCell) {
          this.model.scrollToView(this.activeCell);
        }
      });
    }
  };

  runCellandInsertBelow = async (cell: CellView) => {
    this.enterCommandMode(true);
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      const insertIndex = this.findCellIndex(
        this.model.selections[this.model.selections.length - 1],
      );
      this.addCell(
        { id: v4(), cell: { cell_type: cell.model.type, source: '', metadata: {} } },
        insertIndex + 1,
      );
      this.runCells(this.model.selections);
    } else {
      const insertIndex = this.findCellIndex(cell);
      this.addCell(
        { id: v4(), cell: { cell_type: cell.model.type, source: '', metadata: {} } },
        insertIndex + 1,
      );
      this.runCells([cell]);
    }
  };

  moveUpCell = (cell: CellView) => {
    this.collapseCell(cell, false);
    const previousCell = this.getPreviousVisibleCell(cell);
    if (previousCell) {
      this.collapseCell(previousCell, false);
    }
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        const selectIndex = this.findCellIndex(selectedCell);
        if (selectIndex === 0) {
          return;
        }
        this.model.exchangeCells(this.model.selections, selectIndex - 1);
      }
    } else {
      const sourceIndex = this.findCellIndex(cell);
      if (sourceIndex > -1) {
        this.model.exchangeCell(sourceIndex, sourceIndex - 1);
      }
    }
  };

  moveDownCell = (cell: CellView) => {
    this.collapseCell(cell, false);
    const nextCell = this.getNextVisibleCell(cell);
    if (nextCell) {
      this.collapseCell(nextCell, false);
    }
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (let i = this.model.selections.length - 1; i > -1; i--) {
        const selectIndex = this.findCellIndex(this.model.selections[i]);
        if (selectIndex === this.model.cells.length - 1) {
          return;
        }
        this.model.exchangeCells(this.model.selections, selectIndex + 1);
      }
    } else {
      const sourceIndex = this.findCellIndex(cell);
      if (sourceIndex > -1) {
        this.model.exchangeCell(sourceIndex, sourceIndex + 1);
      }
    }
  };

  getPreviousVisibleCell(cell: CellView) {
    const currentIndex = this.findCellIndex(cell);
    return this.model.cells
      .slice()
      .reverse()
      .find(
        (item, index) =>
          index > this.model.cells.length - currentIndex - 1 &&
          item.collapsedHidden === false,
      );
  }

  getNextVisibleCell(cell: CellView) {
    const currentIndex = this.findCellIndex(cell);
    return this.model.cells.find(
      (item, index) => index > currentIndex && item.collapsedHidden === false,
    );
  }

  copyCell = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      this.model.clipboard = this.model.selections;
      this.model.selections = [];
    } else {
      this.model.clipboard = cell;
    }
    this.model.lastClipboardInteraction = 'copy';
  };

  cutCell = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      this.model.clipboard = this.model.selections;
      this.model.selections = [];
      for (const cutCell of this.model.clipboard) {
        this.deleteCell(cutCell);
      }
    } else {
      this.model.clipboard = cell;
      this.deleteCell(cell);
    }
    this.model.lastClipboardInteraction = 'cut';
  };

  pasteCell = (cell: CellView) => {
    let pasteIndex = this.model.getCells().findIndex((item) => {
      return equals(item, cell);
    });
    const pasteCells = getOrigin(this.model.clipboard);
    if (!this.model.lastClipboardInteraction || !pasteCells) {
      return;
    }
    if (this.model.lastClipboardInteraction === 'copy') {
      if (Array.isArray(pasteCells)) {
        for (const pasteCell of pasteCells) {
          const cellOptions = pasteCell.toJSONWithoutId();
          this.addCell({ id: v4(), cell: cellOptions }, pasteIndex + 1);
          pasteIndex++;
        }
      } else {
        const cellOptions = pasteCells.toJSONWithoutId();
        this.addCell({ id: v4(), cell: cellOptions }, pasteIndex + 1);
      }
    } else {
      if (Array.isArray(pasteCells)) {
        for (const pasteCell of pasteCells) {
          this.model.addCell(pasteCell, pasteIndex + 1);
          this.model.deletedCells.splice(this.model.deletedCells.indexOf(pasteCell), 1);
          pasteIndex++;
        }
      } else {
        this.model.addCell(pasteCells, pasteIndex + 1);
        this.model.deletedCells.splice(this.model.deletedCells.indexOf(pasteCells), 1);
      }
      this.model.lastClipboardInteraction = '';
    }
  };

  pasteCellAbove = (cell: CellView) => {
    let pasteIndex = this.model.getCells().findIndex((item) => {
      return equals(item, cell);
    });
    const pasteCells = getOrigin(this.model.clipboard);
    if (!this.model.lastClipboardInteraction || !pasteCells) {
      return;
    }
    if (this.model.lastClipboardInteraction === 'copy') {
      if (Array.isArray(pasteCells)) {
        for (const pasteCell of pasteCells) {
          const cellOptions = pasteCell.toJSONWithoutId();
          this.addCell({ id: v4(), cell: cellOptions }, pasteIndex);
          pasteIndex++;
        }
      } else {
        const cellOptions = pasteCells.toJSONWithoutId();
        this.addCell({ id: v4(), cell: cellOptions }, pasteIndex);
      }
    } else {
      if (Array.isArray(pasteCells)) {
        for (const pasteCell of pasteCells) {
          this.model.addCell(pasteCell, pasteIndex);
          this.model.deletedCells.splice(this.model.deletedCells.indexOf(pasteCell), 1);
          pasteIndex++;
        }
      } else {
        this.model.addCell(pasteCells, pasteIndex);
        this.model.deletedCells.splice(this.model.deletedCells.indexOf(pasteCells), 1);
      }
      this.model.lastClipboardInteraction = '';
    }
  };

  invertCell = async (cell: CellView, type: string) => {
    const cellIndex = this.model.getCells().findIndex((item) => {
      return equals(item, cell);
    });
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        const cellOptions: CellOptions = {
          cell: {
            cell_type: type,
            source: selectedCell.model.source,
            metadata: {
              ...selectedCell.model.metadata,
              libroFormatter: (selectedCell.model as LibroCellModel).libroFormatType,
            },
          },
        };
        const cellView = await this.getCellViewByOption(cellOptions);
        this.model.invertCell(cellView, cellIndex);
      }
    } else {
      const cellOptions: CellOptions = {
        cell: {
          cell_type: type,
          source: cell.model.source,
          metadata: {
            ...cell.model.metadata,
            libroFormatter: (cell.model as LibroCellModel).libroFormatType,
            libroCellType: type,
          },
        },
      };

      const cellView = await this.getCellViewByOption(cellOptions);
      this.model.invertCell(cellView, cellIndex);
    }
  };

  clearOutputs = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (
          ExecutableCellView.is(selectedCell) &&
          ExecutableCellModel.is(selectedCell.model)
        ) {
          selectedCell.clearExecution();
          selectedCell.model.executing = false;
          selectedCell.model.hasOutputHidden = false;
        }
      }
    } else {
      if (ExecutableCellView.is(cell) && ExecutableCellModel.is(cell.model)) {
        cell.clearExecution();
        cell.model.executing = false;
        cell.model.hasOutputHidden = false;
      }
    }
  };

  clearAllOutputs = () => {
    if (this.virtualizedManager.isVirtualized) {
      this.model.scrollToCellView({ cellIndex: 0 });
    } // 清空所有 cell滚动到最上面
    for (const cell of this.model.cells) {
      if (ExecutableCellView.is(cell) && ExecutableCellModel.is(cell.model)) {
        cell.clearExecution();
        cell.model.executing = false;
        cell.model.hasOutputHidden = false;
      }
    }
  };

  hideCellCode = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        selectedCell.hasInputHidden = true;
      }
    } else {
      cell.hasInputHidden = true;
    }
  };

  hideOrShowCellCode = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        selectedCell.hasInputHidden = !selectedCell.hasInputHidden;
      }
    } else {
      cell.hasInputHidden = !cell.hasInputHidden;
    }
  };

  hideOutputs = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (ExecutableCellModel.is(selectedCell.model)) {
          selectedCell.model.hasOutputHidden = true;
        }
      }
    } else {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputHidden = true;
      }
    }
  };

  hideOrShowOutputs = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (ExecutableCellModel.is(selectedCell.model)) {
          selectedCell.model.hasOutputHidden = !selectedCell.model.hasOutputHidden;
        }
      }
    } else {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputHidden = !cell.model.hasOutputHidden;
      }
    }
  };

  hideAllOutputs = () => {
    for (const cell of this.model.cells) {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputHidden = true;
      }
    }
  };

  hideAllCellCode = () => {
    for (const cell of this.model.cells) {
      cell.hasInputHidden = true;
    }
  };

  showCellCode = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        selectedCell.hasInputHidden = false;
      }
    } else {
      cell.hasInputHidden = false;
    }
  };

  showAllCellCode = () => {
    for (const cell of this.model.cells) {
      cell.hasInputHidden = false;
    }
  };

  showCellOutputs = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (ExecutableCellModel.is(selectedCell.model)) {
          selectedCell.model.hasOutputHidden = false;
        }
      }
    } else {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputHidden = false;
      }
    }
  };

  showAllCellOutputs = () => {
    for (const cell of this.model.cells) {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputHidden = false;
      }
    }
  };

  /**
   * Whether a cell is selected.
   */
  isSelected(cell: CellView): boolean {
    if (equals(this.activeCell, cell)) {
      return true;
    }
    if (this.model.selections.length !== 0) {
      return this.model.selections.findIndex((item) => item.id === cell.id) >= 0
        ? true
        : false;
    }
    return false;
  }

  extendSelectionAbove = () => {
    if (this.activeCell) {
      const previousCell = this.getPreviousVisibleCell(this.activeCell);
      if (previousCell) {
        this.collapseCell(previousCell, false);
      }
      const activeIndex = this.findCellIndex(this.activeCell);
      if (this.findCellIndex(this.activeCell) > 0) {
        this.extendContiguousSelectionTo(activeIndex - 1);
      }
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(this.activeCell);
      }
    }
  };

  extendSelectionToTop = () => {
    if (this.activeCell) {
      if (this.findCellIndex(this.activeCell) > 0) {
        this.extendContiguousSelectionTo(0);
      }
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(this.activeCell);
      }
    }
  };

  extendSelectionBelow = () => {
    if (this.activeCell) {
      const nextCell = this.getNextVisibleCell(this.activeCell);
      if (nextCell) {
        this.collapseCell(nextCell, false);
      }
      const activeIndex = this.findCellIndex(this.activeCell);
      if (this.findCellIndex(this.activeCell) >= 0) {
        this.extendContiguousSelectionTo(activeIndex + 1);
      }
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(this.activeCell);
      }
    }
  };

  extendSelectionToBottom = () => {
    if (this.activeCell) {
      if (this.findCellIndex(this.activeCell) > 0) {
        this.extendContiguousSelectionTo(this.model.cells.length - 1);
      }
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(this.activeCell);
      }
    }
  };

  /**
   * Move the head of an existing contiguous selection to extend the selection.
   *
   * @param index - The new head of the existing selection.
   *
   * #### Notes
   * If there is no existing selection, the active cell is considered an
   * existing one-cell selection.
   *
   * If the new selection is a single cell, that cell becomes the active cell
   * and all cells are deselected.
   *
   * There is no change if there are no cells (i.e., activeCellIndex is -1).
   */
  extendContiguousSelectionTo(index: number): void {
    let selectIndex = index;
    let { head, anchor } = this.getContiguousSelection();
    if (this.activeCell) {
      // Handle the case of no current selection.
      if (anchor === null || head === null) {
        if (selectIndex === this.model.activeIndex) {
          // Already collapsed selection, nothing more to do.
          return;
        }

        // We will start a new selection below.
        head = this.model.activeIndex;
        anchor = this.model.activeIndex;
      }
      // Move the active cell. We do this before the collapsing shortcut below.
      if (this.model.cells[selectIndex]) {
        this.model.active = this.model.cells[selectIndex];
        this.model.activeIndex = selectIndex;
      }
      // Make sure the index is valid, according to the rules for setting and clipping the
      // active cell index. This may change the index.
      selectIndex = this.model.activeIndex;

      // Collapse the selection if it is only the active cell.
      if (selectIndex === anchor) {
        // this.deselectAll();
        this.model.selections = [];
        return;
      }
      this.model.selections = this.model.cells.slice(
        Math.min(anchor, selectIndex),
        Math.max(anchor, selectIndex) + 1,
      );
    }
  }

  /**
   * Get the head and anchor of a contiguous cell selection.
   *
   * The head of a contiguous selection is always the active cell.
   *
   * If there are no cells selected, `{head: null, anchor: null}` is returned.
   *
   * Throws an error if the currently selected cells do not form a contiguous
   * selection.
   */
  getContiguousSelection():
    | { head: number; anchor: number }
    | { head: null; anchor: null } {
    if (this.model.selections.length !== 0 && this.activeCell) {
      const first = this.findCellIndex(this.model.selections[0]);
      const last = this.findCellIndex(
        this.model.selections[this.model.selections.length - 1],
      );
      // Check that the active cell is one of the endpoints of the selection.
      const activeIndex = this.findCellIndex(this.activeCell);
      if (first !== activeIndex && last !== activeIndex) {
        throw new Error('Active cell not at endpoint of selection');
      }

      // Determine the head and anchor of the selection.
      if (first === activeIndex) {
        return { head: first, anchor: last };
      } else {
        return { head: last, anchor: first };
      }
    }
    return { head: null, anchor: null };
  }

  enableOutputScrolling = (cell: CellView) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (ExecutableCellModel.is(selectedCell.model)) {
          selectedCell.model.hasOutputsScrolled = true;
        }
      }
    } else {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputsScrolled = true;
      }
    }
  };

  disableOutputScrolling = (cell: CellView) => {
    this.outputsScroll = false;
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      for (const selectedCell of this.model.selections) {
        if (ExecutableCellModel.is(selectedCell.model)) {
          selectedCell.model.hasOutputsScrolled = false;
        }
      }
    } else {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputsScrolled = false;
      }
    }
  };

  disableAllOutputScrolling = () => {
    this.outputsScroll = false;
    for (const cell of this.model.cells) {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputsScrolled = false;
      }
    }
  };

  enableAllOutputScrolling = () => {
    this.outputsScroll = true;
    for (const cell of this.model.cells) {
      if (ExecutableCellModel.is(cell.model)) {
        cell.model.hasOutputsScrolled = true;
      }
    }
  };

  disposed = false;

  override dispose() {
    if (!this.disposed) {
      this.libroService.deleteLibroViewFromCache(this);
      this.toDispose.dispose();
    }
    this.disposed = true;
  }

  enterCommandMode = (isInLibro: boolean) => {
    if (this.hasModal) {
      return;
    }
    if (this.model.enterCommandMode) {
      this.model.enterCommandMode();
    }
    if (isInLibro) {
      this.container?.current?.focus();
    }
  };

  enterEditMode = () => {
    if (this.model.enterEditMode) {
      this.model.enterEditMode();
    }
  };

  moveCursorDown = (cell: CellView) => {
    const newSelectedCell = this.getNextVisibleCell(cell);
    if (newSelectedCell) {
      this.model.selectCell(newSelectedCell);
      this.model.selections = [];
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(newSelectedCell);
      }
    }
  };

  moveCursorUp = (cell: CellView) => {
    const newSelectedCell = this.getPreviousVisibleCell(cell);
    if (newSelectedCell) {
      this.model.selectCell(newSelectedCell);
      this.model.selections = [];
      if (this.virtualizedManager.isVirtualized) {
        this.model.scrollToCellView({ cellIndex: this.activeCellIndex });
      } else {
        this.model.scrollToView(newSelectedCell);
      }
    }
  };

  mergeCellBelow = async (cell: CellView) => {
    const { cells, selections } = this.model;
    if (selections.length > 1) {
      this.mergeCells(cell);
      return;
    }
    const selectedIndex = this.findCellIndex(cell);
    if (selectedIndex >= cells.length - 1) {
      return;
    }
    const nextCell = cells[selectedIndex + 1];
    const source = concatMultilineString([
      cell.model.value + '\n',
      nextCell.model.value,
    ]);
    const cellView = await this.getCellViewByOption({
      id: v4(),
      cell: { cell_type: cell.model.type, source, metadata: {} },
    });
    if (this.model instanceof LibroModel) {
      this.model.activeIndex = selectedIndex;
      const cellData = [cellView].map((_cell) => {
        (this.model as LibroModel).cellViewCache.set(_cell.model.id, _cell);
        return _cell.toJSON();
      });
      this.model.sharedModel.transact(() => {
        this.model.sharedModel.deleteCell(selectedIndex);
        this.model.sharedModel.insertCells(selectedIndex, cellData);
        this.model.sharedModel.deleteCell(selectedIndex + 1);
      });
    }
  };

  mergeCellAbove = async (cell: CellView) => {
    const { cells, selections } = this.model;
    if (selections.length > 1) {
      this.mergeCells(cell);
      return;
    }
    const selectedIndex = this.findCellIndex(cell);
    if (selectedIndex <= 0) {
      return;
    }
    const prevCell = cells[selectedIndex - 1];
    const source = concatMultilineString([
      prevCell.model.value + '\n' + cell.model.value,
    ]);
    const cellView = await this.getCellViewByOption({
      id: v4(),
      cell: { cell_type: cell.model.type, source, metadata: {} },
    });
    if (this.model instanceof LibroModel) {
      this.model.activeIndex = selectedIndex - 1;
      const cellData = [cellView].map((_cell) => {
        (this.model as LibroModel).cellViewCache.set(_cell.model.id, _cell);
        return _cell.toJSON();
      });
      this.model.sharedModel.transact(() => {
        this.model.sharedModel.deleteCell(selectedIndex - 1);
        this.model.sharedModel.insertCells(selectedIndex - 1, cellData);
        this.model.sharedModel.deleteCell(selectedIndex);
      });
    }
  };

  mergeCells = async (cell: CellView) => {
    const { selections } = this.model;
    if (selections.length <= 1) {
      return;
    }
    const selectionsValue: string[] = [];
    const selectionsIndex: number[] = [];
    selections.map((item) => {
      selectionsValue.push(item.model.value);
      selectionsValue.push('\n');
      const index = this.findCellIndex(item);
      selectionsIndex.push(index);
    });
    const source = concatMultilineString(selectionsValue);
    const cellView = await this.getCellViewByOption({
      id: v4(),
      cell: { cell_type: cell.model.type, source, metadata: {} },
    });

    if (this.model instanceof LibroModel) {
      this.model.activeIndex = Math.min(...selectionsIndex);
      const cellData = [cellView].map((_cell) => {
        (this.model as LibroModel).cellViewCache.set(_cell.model.id, _cell);
        return _cell.toJSON();
      });
      const startIndex = Math.min(...selectionsIndex);
      const endIndex = Math.max(...selectionsIndex);
      this.model.sharedModel.transact(() => {
        this.model.sharedModel.deleteCellRange(startIndex, endIndex + 1);
        this.model.sharedModel.insertCells(Math.min(...selectionsIndex), cellData);
      });
    }
  };
  selectAllCell = () => {
    this.model.selections = this.model.cells;
  };

  splitCell = async (cell: CellView) => {
    const index = this.findCellIndex(cell);
    if (EditorCellView.is(cell)) {
      const selections = cell.editor?.getSelections() ?? [];
      const offsets = [0];
      for (let i = 0; i < selections.length; i++) {
        // append start and end to handle selections
        // cursors will have same start and end
        const select = selections[i];
        const start = cell.editor?.getOffsetAt(select.start) ?? 0;
        const end = cell.editor?.getOffsetAt(select.end) ?? 0;
        if (start < end) {
          offsets.push(start);
          offsets.push(end);
        } else if (end < start) {
          offsets.push(end);
          offsets.push(start);
        } else {
          offsets.push(start);
        }
      }

      offsets.push(cell.model.value.length);

      const splitCells = await Promise.all(
        offsets.slice(0, -1).map(async (offset, offsetIdx) => {
          const cellView = await this.getCellViewByOption({
            id: v4(),
            cell: {
              cell_type: cell.model.type,
              source: cell.model.value
                .slice(offset, offsets[offsetIdx + 1])
                .replace(/^\n+/, '')
                .replace(/\n+$/, ''),
              metadata: {},
            },
          });
          return cellView;
        }),
      );
      this.model.splitCell(splitCells, index);
    }
  };
  restartClearOutput = () => {
    if (this.model.restart) {
      this.model.restart();
    }
    this.clearAllOutputs();
  };

  closeAndShutdown = () => {
    if (this.model.shutdown) {
      this.model.shutdown();
    }
  };

  /**
   * Set the markdown header level of a cell.
   */
  setMarkdownHeader = async (cell: CellView, level: number) => {
    if (this.model.selections.length !== 0 && this.isSelected(cell)) {
      const { selections } = this.model;
      const selectionsValue: string[] = [];
      const selectionsIndex: number[] = [];
      const cellViews = await Promise.all(
        selections.map(async (item) => {
          let source = item.model.value;
          const regex = /^(#+\s*)|^(\s*)/;
          const newHeader = Array(level + 1).join('#') + ' ';
          const matches = regex.exec(source);
          if (matches) {
            source = source.slice(matches[0].length);
          }
          source = newHeader + source;
          selectionsValue.push(source);
          const index = this.findCellIndex(item);
          selectionsIndex.push(index);
          const cellView = await this.getCellViewByOption({
            id: v4(),
            cell: { cell_type: 'markdown', source, metadata: {} },
          });
          return cellView;
        }),
      );
      // TODO: why is this needed?
      // const source = concatMultilineString(selectionsValue);

      if (this.model instanceof LibroModel) {
        this.model.activeIndex = Math.min(...selectionsIndex);
        const cellData = cellViews.map((_cell) => {
          (this.model as LibroModel).cellViewCache.set(_cell.model.id, _cell);
          return _cell.toJSON();
        });
        const startIndex = Math.min(...selectionsIndex);
        const endIndex = Math.max(...selectionsIndex);
        this.model.sharedModel.transact(() => {
          this.model.sharedModel.deleteCellRange(startIndex, endIndex + 1);
          this.model.sharedModel.insertCells(startIndex, cellData);
        });
      }
    } else {
      const index = this.findCellIndex(cell);
      let source = cell.model.value;
      const regex = /^(#+\s*)|^(\s*)/;
      const newHeader = Array(level + 1).join('#') + ' ';
      const matches = regex.exec(source);
      if (matches) {
        source = source.slice(matches[0].length);
      }
      source = newHeader + source;
      const cellView = await this.getCellViewByOption({
        id: v4(),
        cell: { cell_type: 'markdown', source, metadata: {} },
      });

      if (this.model instanceof LibroModel) {
        this.model.activeIndex = index;
        const cellData = [cellView].map((_cell) => {
          (this.model as LibroModel).cellViewCache.set(_cell.model.id, _cell);
          return _cell.toJSON();
        });
        this.model.sharedModel.transact(() => {
          this.model.sharedModel.deleteCell(index);
          this.model.sharedModel.insertCells(index, cellData);
        });
      }
    }
    this.enterCommandMode(true);
  };

  collapseCell(cell: CellView, collspse: boolean) {
    this.collapseService.setHeadingCollapse(cell, collspse);
  }

  save() {
    this.saving = true;
    try {
      this.model.saveNotebookContent();
      this.onSaveEmitter.fire(true);
      this.model.dirty = false;
    } catch (ex) {
      this.onSaveEmitter.fire(false);
    } finally {
      this.saving = false;
    }
  }
}
