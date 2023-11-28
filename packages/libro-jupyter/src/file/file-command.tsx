import pathUtil from 'path';

import { ReloadOutlined } from '@ant-design/icons';
import type {
  CommandRegistry,
  MenuPath,
  MenuRegistry,
  ToolbarRegistry,
} from '@difizen/mana-app';
import { ViewManager } from '@difizen/mana-app';
import {
  CommandContribution,
  FileStatNode,
  FileTreeCommand,
  inject,
  MenuContribution,
  ModalService,
  OpenerService,
  singleton,
  ToolbarContribution,
  URI,
} from '@difizen/mana-app';
import { message, Modal } from 'antd';

import { FileCreateModal } from './file-create-modal.js';
import { FileDirCreateModal } from './file-createdir-modal.js';
import { FileRenameModal } from './file-rename-modal.js';
import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';
import { copy2clipboard } from './utils.js';

const FileCommands = {
  OPEN_FILE: {
    id: 'fileTree.command.openfile',
    label: '打开',
  },
  COPY: {
    id: 'fileTree.command.copy',
    label: '复制',
  },
  PASTE: {
    id: 'fileTree.command.paste',
    label: '粘贴',
  },
  CUT: {
    id: 'fileTree.command.cut',
    label: '剪切',
  },
  RENAME: {
    id: 'fileTree.command.rename',
    label: '重命名',
  },
  COPY_PATH: {
    id: 'fileTree.command.copyPath',
    label: '复制路径',
  },
  COPY_RELATIVE_PATH: {
    id: 'fileTree.command.copyRelativePath',
    label: '复制相对路径',
  },
  CREATE_FILE: {
    id: 'fileTree.command.createfile',
    label: '新建文件',
  },
  CREATE_DIR: {
    id: 'fileTree.command.createdir',
    label: '新建文件夹',
  },
  REFRESH: {
    id: 'fileTree.command.refresh',
    label: '刷新',
  },
};
export const FileTreeContextMenuPath: MenuPath = ['file-tree-context-menu'];

@singleton({
  contrib: [CommandContribution, MenuContribution, ToolbarContribution],
})
export class FileCommandContribution
  implements CommandContribution, MenuContribution, ToolbarContribution
{
  protected viewManager: ViewManager;
  @inject(JupyterFileService) fileService: JupyterFileService;
  @inject(ModalService) modalService: ModalService;
  @inject(OpenerService) protected openService: OpenerService;
  fileView: FileView;
  lastAction: 'COPY' | 'CUT';
  lastActionNode: FileStatNode;

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
      id: FileCommands.CREATE_FILE.id,
      command: FileCommands.CREATE_FILE.id,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.CREATE_DIR.id,
      command: FileCommands.CREATE_DIR.id,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.OPEN_FILE.id,
      command: FileCommands.OPEN_FILE.id,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.COPY.id,
      command: FileCommands.COPY.id,
      order: 'b',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.PASTE.id,
      command: FileCommands.PASTE.id,
      order: 'c',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.CUT.id,
      command: FileCommands.CUT.id,
      order: 'd',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.RENAME.id,
      command: FileCommands.RENAME.id,
      order: 'e',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.COPY_PATH.id,
      command: FileCommands.COPY_PATH.id,
      order: 'g',
    });
    menu.registerMenuAction(FileTreeContextMenuPath, {
      id: FileCommands.COPY_RELATIVE_PATH.id,
      command: FileCommands.COPY_RELATIVE_PATH.id,
      order: 'g',
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
              .catch(() => {
                throw Error();
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
    command.registerHandler(FileTreeCommand.REMOVE.id, {
      execute: (node) => {
        if (FileStatNode.is(node)) {
          const filePath = node.uri.path.toString();
          Modal.confirm({
            title: '确认删除一下文件或文件夹？',
            content: filePath,
            onOk: async () => {
              try {
                await this.fileService.delete(node.uri);
              } catch {
                message.error('删除文件失败!');
              }
              this.fileView.model.refresh();
            },
          });
        }
      },
      isVisible: (node) => {
        return FileStatNode.is(node);
      },
    });
    command.registerCommand(FileCommands.COPY, {
      execute: (node) => {
        this.lastAction = 'COPY';
        this.lastActionNode = node;
      },
      isVisible: (node) => {
        return FileStatNode.is(node) && node.fileStat.isFile;
      },
    });
    command.registerCommand(FileCommands.CUT, {
      execute: (node) => {
        this.lastAction = 'CUT';
        this.lastActionNode = node;
      },
      isVisible: (node) => {
        return FileStatNode.is(node) && node.fileStat.isFile;
      },
    });
    command.registerCommand(FileCommands.PASTE, {
      execute: async (data) => {
        try {
          if (FileStatNode.is(data)) {
            const targetUri = data.fileStat.isDirectory ? data.uri : data.uri.parent;
            await this.fileService.copy(this.lastActionNode.uri, targetUri);
          } else if (data instanceof FileView) {
            const targetPath = '/';
            await this.fileService.copy(this.lastActionNode.uri, new URI(targetPath));
          }
          if (this.lastAction === 'CUT') {
            await this.fileService.delete(this.lastActionNode.uri);
          }
          this.fileView.model.refresh();
          return;
        } catch {
          message.error('粘贴失败!');
        }
      },
      isVisible: () => {
        return this.lastAction === 'CUT' || this.lastAction === 'COPY';
      },
    });
    command.registerCommand(FileCommands.RENAME, {
      execute: async (node) => {
        this.modalService.openModal(FileRenameModal, {
          resource: node.uri,
          fileName: node.uri.path.base,
        });
      },
      isVisible: (node) => {
        return FileStatNode.is(node);
      },
    });
    command.registerCommand(FileCommands.CREATE_FILE, {
      execute: async (data) => {
        let path = '/workspace';
        if (FileStatNode.is(data)) {
          path = data.fileStat.isDirectory
            ? data.uri.path.toString()
            : data.uri.path.dir.toString();
        }
        this.modalService.openModal(FileCreateModal, {
          path,
        });
      },
    });
    command.registerCommand(FileCommands.CREATE_DIR, {
      execute: async (data) => {
        let path = '/workspace';
        if (FileStatNode.is(data)) {
          path = data.fileStat.isDirectory
            ? data.uri.path.toString()
            : data.uri.path.dir.toString();
        }
        this.modalService.openModal(FileDirCreateModal, {
          path,
        });
      },
    });

    command.registerCommand(FileCommands.COPY_PATH, {
      execute: async (data) => {
        let path = '/workspace';
        if (FileStatNode.is(data)) {
          path = data.uri.path.toString();
        }
        copy2clipboard(path);
      },
    });

    command.registerCommand(FileCommands.COPY_RELATIVE_PATH, {
      execute: async (data) => {
        let relative = '';
        if (FileStatNode.is(data)) {
          relative = pathUtil.relative('/workspace', data.uri.path.toString());
        }
        copy2clipboard(relative);
      },
    });

    command.registerCommand(FileCommands.REFRESH, {
      execute: async (view) => {
        if (view instanceof FileView) {
          view.model.refresh();
        }
      },
      isVisible: (view) => {
        return view instanceof FileView;
      },
    });
  }

  registerToolbarItems(toolbarRegistry: ToolbarRegistry): void {
    toolbarRegistry.registerItem({
      id: FileCommands.REFRESH.id,
      command: FileCommands.REFRESH.id,
      icon: <ReloadOutlined />,
      tooltip: '刷新',
    });
  }
}
