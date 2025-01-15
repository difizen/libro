/* eslint-disable promise/always-return */
import type { LibroView } from '@difizen/libro-jupyter';
import {
  DocumentCommands,
  LibroService,
  NotebookCommands,
} from '@difizen/libro-jupyter';
import { CommandRegistry, ViewRender, useInject } from '@difizen/mana-app';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

import { LibroCommandDemoService } from '@/modules/libro-command/libro-command-demo-service';
import { LibroDemoCommand } from '@/modules/libro-command/libro-demo-command';

export const LibroCommandDemo: React.FC = () => {
  const libroService = useInject<LibroService>(LibroService);
  const [libroView, setLibroView] = useState<LibroView | undefined>();
  const commandRegistry = useInject(CommandRegistry);
  const libroCommandDemo = useInject<LibroCommandDemoService>(LibroCommandDemoService);

  const save = () => {
    //通过命令进行保存
    commandRegistry.executeCommand(
      DocumentCommands['Save'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  const selectAll = () => {
    //通过命令执行 cell 全选操作
    commandRegistry.executeCommand(
      NotebookCommands['SelectAll'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  const runAllCells = () => {
    //通过命令执行 cell 全选操作
    commandRegistry.executeCommand(
      NotebookCommands['RunAllCells'].id,
      undefined,
      libroView,
      undefined,
    );
  };

  const insertCellBelow = () => {
    //通过命令执行 cell 全选操作
    commandRegistry.executeCommand(
      NotebookCommands['InsertCellBelow'].id,
      libroView?.activeCell,
      libroView,
      undefined,
    );
  };

  const demoCommand1 = () => {
    //执行使用使用 LibroCommandRegister 的方式注册的 demoCommand1
    commandRegistry.executeCommand(LibroDemoCommand['demoCommand1'].id);
  };

  const demoCommand2 = () => {
    //执行使用使用 CommandRegistry 的方式注册的 demoCommand2
    commandRegistry.executeCommand(LibroDemoCommand['demoCommand2'].id);
  };

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    libroService
      .getOrCreateView({
        //这里可以给每个 libro 编辑器增加标识，用于区分每次打开编辑器里面的内容都不一样
      })
      .then((libro) => {
        if (!libro) {
          return;
        }
        setLibroView(libro);
      });
  }, [libroService]);

  return (
    <div className="libro-command-container">
      <div className="libro-command-demo-panel">
        <div>内置命令 Demo:</div>
        <Button type="primary" onClick={save} className="libro-command-demo-btn">
          保存文件
        </Button>
        <Button type="primary" onClick={selectAll} className="libro-command-demo-btn">
          全选 Cell
        </Button>
        <Button type="primary" onClick={runAllCells} className="libro-command-demo-btn">
          执行所有 Cell
        </Button>
        <Button
          type="primary"
          onClick={insertCellBelow}
          className="libro-command-demo-btn"
        >
          向下新增 Cell
        </Button>
        <Button
          type="primary"
          onClick={() => {
            libroCommandDemo.save(libroView);
          }}
          className="libro-command-demo-btn"
          ghost
        >
          保存文件
        </Button>
        <Button
          type="primary"
          onClick={() => {
            libroCommandDemo.selectAll(libroView);
          }}
          className="libro-command-demo-btn"
          ghost
        >
          全选 Cell
        </Button>
        <Button
          type="primary"
          onClick={() => {
            libroCommandDemo.runAllCells(libroView);
          }}
          className="libro-command-demo-btn"
          ghost
        >
          执行所有 Cell
        </Button>
        <Button
          type="primary"
          onClick={() => {
            libroCommandDemo.insertCellBelow(libroView);
          }}
          className="libro-command-demo-btn"
          ghost
        >
          向下新增 Cell
        </Button>
        <div>自定义命令 Demo:</div>
        <Button
          type="primary"
          onClick={demoCommand1}
          className="libro-command-demo-btn"
        >
          自定义命令1
        </Button>
        <Button
          type="primary"
          onClick={demoCommand2}
          className="libro-command-demo-btn"
        >
          自定义命令2
        </Button>
      </div>
      {libroView && <ViewRender view={libroView} />}
    </div>
  );
};
