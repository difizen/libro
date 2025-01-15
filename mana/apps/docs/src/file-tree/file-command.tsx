import type { CommandRegistry, MenuPath, MenuRegistry } from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import {
  CommandContribution,
  FileStatNode,
  inject,
  MenuContribution,
  OpenerService,
  singleton,
} from '@difizen/mana-app';
import { message } from 'antd';

import { FileView } from './file-view/index.js';

const FileCommands = {
  CREATE_FILE: {
    id: 'fileTree.command.createfile',
    label: '新建文件',
  },
  OPEN_FILE: {
    id: 'fileTree.command.openfile',
    label: '打开',
  },
};
export const FileTreeContextMenuPath: MenuPath = ['file-tree-context-menu'];

@singleton({
  contrib: [CommandContribution, MenuContribution],
})
export class FileCommandContribution implements CommandContribution, MenuContribution {
  protected viewManager: ViewManager;
  @inject(OpenerService) protected openService!: OpenerService;
  fileView?: FileView;
  lastAction?: 'COPY' | 'CUT';
  lastActionNode?: FileStatNode;

  constructor(@inject(ViewManager) viewManager: ViewManager) {
    this.viewManager = viewManager;
    this.viewManager
      .getOrCreateView(FileView)
      .then((view) => {
        this.fileView = view;
        return;
      })
      .catch(() => {
        //
      });
  }

  registerMenus(menu: MenuRegistry) {
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.OPEN_FILE.id,
      command: FileCommands.OPEN_FILE.id,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.CREATE_FILE.id,
      command: FileCommands.CREATE_FILE.id,
      order: 'b',
    });
  }
  registerCommands(command: CommandRegistry): void {
    command.registerCommand(FileCommands.OPEN_FILE, {
      execute: (node) => {
        try {
          if (node.fileStat.isFile) {
            this.openService
              .getOpener(node.uri)
              .then((opener) => {
                if (opener) {
                  opener.open(node.uri, {
                    viewOptions: {
                      name: node.fileStat.name,
                    },
                  });
                }
                return;
              })
              .catch((e) => {
                throw e;
              });
          }
        } catch {
          message.error('文件打开失败');
        }
      },
      isVisible: (node) => {
        return FileStatNode.is(node) && node.fileStat.isFile;
      },
    });

    command.registerCommand(FileCommands.CREATE_FILE, {
      execute: async (data) => {
        let path = this.fileView?.model.location?.path.toString() || '/';
        if (FileStatNode.is(data)) {
          path = data.fileStat.isDirectory
            ? data.uri.path.toString()
            : data.uri.path.dir.toString();
        }
        console.info('create file at', path);
      },
    });
  }
}
