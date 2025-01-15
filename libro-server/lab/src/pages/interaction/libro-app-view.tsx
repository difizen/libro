import type { NotebookOption } from '@difizen/libro-core';
import { LibroView } from '@difizen/libro-core';
import {
  BaseView,
  getOrigin,
  prop,
  URI,
  useInject,
  useObserve,
  view,
  ViewInstance,
  ViewOption,
} from '@difizen/mana-app';
import { inject, transient } from '@difizen/mana-app';

import {
  CellView,
  DndContentProps,
  ExecutableCellView,
  LibroJupyterView,
  LibroService,
  ServerConnection,
} from '@difizen/libro-jupyter';
import { FC, ReactNode, forwardRef, memo, useCallback, useRef } from 'react';
import { BackTop, Button } from 'antd';
import { ToTopOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { AppCellContainer } from './default-dnd-content.js';
import { DndCellItemRender } from './dnd-cell-item-render.js';
import React from 'react';

export const DndCellRender: FC<DndContentProps> = memo(function DndCellRender({
  cell,
  index,
  ...props
}: DndContentProps) {
  const observableCell = useObserve(cell);
  const appInstance = useInject<LibroAppView>(ViewInstance);
  const instance = appInstance.libroView;
  if (!instance) {
    return null;
  }

  const DndCellContainer = appInstance.dndContentRender;
  return (
    <DndCellContainer cell={observableCell} key={cell.id} index={index} {...props} />
  );
});

export const DndCellsRender = forwardRef<
  HTMLDivElement,
  { libroView: LibroView; addCellButtons: ReactNode }
>(function DndCellsRender(
  { libroView, addCellButtons }: { libroView: LibroView; addCellButtons: ReactNode },
  ref,
) {
  const LoadingRender = getOrigin(libroView.loadingRender);

  const cells = libroView.model.getCells().reduce<CellView[]>(function (a, b) {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);

  const isInitialized = libroView.model.isInitialized;
  const isLoading = !isInitialized;
  const shouldRenderCells = isInitialized;

  return (
    <>
      <div className={classNames('libro-dnd-cells-container')} ref={ref}>
        {isLoading && <LoadingRender />}
        {shouldRenderCells && (
          <div style={{ height: '100%', overflow: 'visible' }}>
            {cells
              .filter((cell) => !cell.collapsedHidden)
              .map((cell, index) => (
                <DndCellRender cell={cell} key={cell.id} index={index} />
              ))}
          </div>
        )}
      </div>
    </>
  );
});

export const LibroAppComponent = memo(function LibroAppComponent() {
  const ref = useRef<HTMLDivElement | null>(null);
  const libroViewTopRef = useRef<HTMLDivElement>(null);
  const libroViewRightContentRef = useRef<HTMLDivElement>(null);
  const libroViewLeftContentRef = useRef<HTMLDivElement>(null);
  const libroViewContentRef = useRef<HTMLDivElement>(null);
  const appInstance = useInject<LibroAppView>(ViewInstance);
  const instance = appInstance.libroView;

  const handleScroll = useCallback(() => {
    if (!instance) {
      return;
    }
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

  if (!instance) {
    return null;
  }

  return (
    <div
      className="libro-view-content"
      onScroll={handleScroll}
      ref={libroViewContentRef}
    >
      <Button onClick={()=>{
      appInstance.serverConnection.makeRequest(
        `${appInstance.serverConnection.settings.baseUrl}libro/api/ai/chatstream`,
        {
          method: 'POST',
          body: JSON.stringify({ test:'asd' }),
        },
      );      }}></Button>
      <div className="libro-view-content-left" ref={libroViewLeftContentRef}>
        <div className="libro-dnd-list-container">
          <DndCellsRender libroView={instance} addCellButtons={null} />
        </div>
      </div>
      <div className="libro-view-content-right" ref={libroViewRightContentRef}></div>
      <BackTop target={() => libroViewContentRef.current || document}>
        <div className="libro-totop-button">
          <Button shape="circle" icon={<ToTopOutlined />} />
        </div>
      </BackTop>
    </div>
  );
});

@transient()
@view('libro-app')
export class LibroAppView extends BaseView {
  protected libroService: LibroService;
  override view = LibroAppComponent;
  dndContentRender: FC<DndContentProps> = AppCellContainer;
  dndItemRender = DndCellItemRender;
  declare uri: URI;

  @inject(ServerConnection) serverConnection: ServerConnection;

  @prop() libroView?: LibroView;

  @prop() executeMessage?: string;

  @prop() executing: boolean = false;

  @prop() executed: number;

  @prop() succeed?: boolean = undefined;

  constructor(
    @inject(ViewOption) options: NotebookOption,
    @inject(LibroService) libroService: LibroService,
  ) {
    super();
    this.libroService = libroService;
    this.libroService.getOrCreateView(options).then((view) => {
      this.libroView = view;
      this.execute();
    });
  }
  get options() {
    return this.libroView?.model.options;
  }

  async execute() {
    if (!(this.libroView instanceof LibroJupyterView)) {
      this.executeMessage = '无法执行';
      this.succeed = false;
      return;
    }
    try {
      this.executing = true;
      this.executeMessage = '准备 kernel...';
      await this.libroView.model.kcReady;
      this.executeMessage = '正在执行...';
      // TODO: use runCells result
      await this.libroView.runCells(this.libroView.model.cells);
      this.succeed = true;
      this.executing = false;
    } catch (e) {
      console.error(e);
    }
  }
}
