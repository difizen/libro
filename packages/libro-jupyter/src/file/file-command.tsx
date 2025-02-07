import pathUtil from 'path';

import { ReloadOutlined } from '@ant-design/icons';
import { ContentsManager } from '@difizen/libro-kernel';
import type {
  CommandRegistry,
  MenuPath,
  MenuRegistry,
  ToolbarRegistry,
} from '@difizen/mana-app';
import { ViewManager, ConfigurationService } from '@difizen/mana-app';
import {
  CommandContribution,
  FileStatNode,
  inject,
  MenuContribution,
  ModalService,
  OpenerService,
  singleton,
  ToolbarContribution,
  URI,
} from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { message, Modal } from 'antd';

import { FileCreateModal } from './file-create-modal.js';
import { FileDirCreateModal } from './file-createdir-modal.js';
import { FileRenameModal } from './file-rename-modal.js';
import { JupyterFileService } from './file-service.js';
import { FileView } from './file-view/index.js';
import { copy2clipboard } from './utils.js';
import './index.less';

export const FileCommands = {
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
  REMOVE: {
    id: 'fileTree.command.remove',
    label: '删除',
  },
  DOWNLOAD: {
    id: 'fileTree.command.download',
    label: '下载',
  },
  UPLOAD: {
    id: 'fileTree.command.upload',
    label: '上传',
  },
};
export const FileTreeContextMenuPath: MenuPath = ['file-tree-context-menu'];
export const FileTreeContextMenuGroups: Record<string, MenuPath> = {
  new: [...FileTreeContextMenuPath, 'a_new'],
  operator: [...FileTreeContextMenuPath, 'b_operator'],
  change: [...FileTreeContextMenuPath, 'c_change'],
  extra: [...FileTreeContextMenuPath, 'd_extra'],
};

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
  @inject(ConfigurationService) configurationService: ConfigurationService;
  @inject(ContentsManager) contentsManager: ContentsManager;

  fileView: FileView;
  lastAction: 'COPY' | 'CUT';
  lastActionNode: FileStatNode;
  allowDownload = false;
  allowUpload = false;

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
    menu.registerGroupMenu(FileTreeContextMenuGroups['new']);
    menu.registerGroupMenu(FileTreeContextMenuGroups['operator']);
    menu.registerGroupMenu(FileTreeContextMenuGroups['change']);
    menu.registerGroupMenu(FileTreeContextMenuGroups['extra']);

    menu.registerMenuAction(FileTreeContextMenuGroups['new'], {
      id: FileCommands.CREATE_FILE.id,
      command: FileCommands.CREATE_FILE.id,
      label: () => <div>{l10n.t(FileCommands.CREATE_FILE.label)}</div>,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['new'], {
      id: FileCommands.CREATE_DIR.id,
      command: FileCommands.CREATE_DIR.id,
      label: () => <div>{l10n.t(FileCommands.CREATE_DIR.label)}</div>,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['new'], {
      id: FileCommands.OPEN_FILE.id,
      command: FileCommands.OPEN_FILE.id,
      label: () => <div>{l10n.t(FileCommands.OPEN_FILE.label)}</div>,
      order: 'a',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['operator'], {
      id: FileCommands.COPY.id,
      command: FileCommands.COPY.id,
      label: () => <div>{l10n.t(FileCommands.COPY.label)}</div>,
      order: 'b',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['operator'], {
      id: FileCommands.PASTE.id,
      command: FileCommands.PASTE.id,
      label: () => <div>{l10n.t(FileCommands.PASTE.label)}</div>,
      order: 'c',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['operator'], {
      id: FileCommands.CUT.id,
      command: FileCommands.CUT.id,
      label: () => <div>{l10n.t(FileCommands.CUT.label)}</div>,
      order: 'd',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['change'], {
      command: FileCommands.REMOVE.id,
      order: 'd',
      ...FileCommands.REMOVE,
      label: () => <div>{l10n.t(FileCommands.REMOVE.label)}</div>,
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['change'], {
      id: FileCommands.RENAME.id,
      command: FileCommands.RENAME.id,
      label: () => <div>{l10n.t(FileCommands.RENAME.label)}</div>,
      order: 'e',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['extra'], {
      id: FileCommands.COPY_PATH.id,
      command: FileCommands.COPY_PATH.id,
      label: () => <div>{l10n.t(FileCommands.COPY_PATH.label)}</div>,
      order: 'f',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['extra'], {
      id: FileCommands.COPY_RELATIVE_PATH.id,
      command: FileCommands.COPY_RELATIVE_PATH.id,
      label: () => <div>{l10n.t(FileCommands.COPY_RELATIVE_PATH.label)}</div>,
      order: 'g',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['extra'], {
      id: FileCommands.DOWNLOAD.id,
      command: FileCommands.DOWNLOAD.id,
      label: () => <div>{l10n.t(FileCommands.DOWNLOAD.label)}</div>,
      order: 'h',
    });
    menu.registerMenuAction(FileTreeContextMenuGroups['extra'], {
      id: FileCommands.UPLOAD.id,
      command: FileCommands.UPLOAD.id,
      label: () => <div>{l10n.t(FileCommands.UPLOAD.label)}</div>,
      order: 'i',
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
          message.error(l10n.t('文件打开失败'));
        }
      },
      isVisible: (node) => {
        return FileStatNode.is(node) && node.fileStat.isFile;
      },
    });
    command.registerHandler(FileCommands.REMOVE.id, {
      execute: (node) => {
        if (FileStatNode.is(node)) {
          const filePath = node.uri.path.toString();
          Modal.confirm({
            width: 424,
            title: l10n.t('确认要删除这个文件/文件夹吗？'),
            content: l10n.t(
              '请确认是否删除文件 {filePath} ，删除后将不可恢复，请谨慎操作。',
              { filePath: filePath },
            ),
            wrapClassName: 'libro-remove-file-modal',
            cancelText: l10n.t('取消'),
            okText: l10n.t('确定'),
            onOk: async () => {
              try {
                await this.fileService.delete(node.uri);
                this.fileService.fileRemoveEmitter.fire(node.uri.path.toString());
              } catch {
                message.error(l10n.t('删除文件失败!'));
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
          message.error(l10n.t('粘贴失败!'));
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
        let path = this.fileView.model.location?.path.toString() || '/';
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
        let path = this.fileView.model.location?.path.toString() || '/';
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
        let path = this.fileView.model.location?.path.toString() || '/';
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
          relative = pathUtil.relative('/', data.uri.path.toString());
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

    command.registerCommand(FileCommands.DOWNLOAD, {
      execute: (data) => {
        if (!FileStatNode.is(data)) {
          return;
        }
        const path = data.uri.path.toString();
        this.contentsManager
          .getDownloadUrl(path)
          .then((url) => {
            const urlObj = new URL(url);
            if (urlObj.origin !== location.origin) {
              // not same origin
              return;
            }
            const element = document.createElement('a');
            element.href = url;
            element.download = '';
            element.target = '_blank';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            return;
          })
          .catch(console.error);
      },
      isVisible: (data) => {
        return this.allowDownload && FileStatNode.is(data) && data.fileStat.isFile;
      },
    });

    command.registerCommand(FileCommands.UPLOAD, {
      execute: (data, view) => {
        if (!this.allowUpload) {
          return;
        }
        if (!view || !(view instanceof FileView)) {
          return;
        }
        if (!data || data instanceof FileView) {
          return view.uploadSubmit();
        }
        if (FileStatNode.is(data) && data.fileStat.isDirectory) {
          return view.uploadSubmit(data.uri.path.toString());
        }
      },
      isVisible: (data, view) => {
        if (!this.allowUpload) {
          return false;
        }
        if (!view || !(view instanceof FileView)) {
          return false;
        }
        if (!data || data instanceof FileView) {
          return true;
        }
        return FileStatNode.is(data) && data.fileStat.isDirectory;
      },
    });
  }

  registerToolbarItems(toolbarRegistry: ToolbarRegistry): void {
    toolbarRegistry.registerItem({
      id: FileCommands.REFRESH.id,
      command: FileCommands.REFRESH.id,
      icon: <ReloadOutlined />,
      tooltip: l10n.t('刷新'),
    });
  }
}
