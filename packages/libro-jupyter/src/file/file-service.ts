import type { IContentsModel } from '@difizen/libro-kernel';
import { ContentsManager } from '@difizen/libro-kernel';
import type {
  CopyFileOptions,
  FileStatWithMetadata,
  MoveFileOptions,
  ResolveFileOptions,
} from '@difizen/mana-app';
import { FileService, URI, inject, singleton } from '@difizen/mana-app';

import { FileNameAlias } from './file-name-alias.js';
import type { DirItem } from './file-protocol.js';

interface FileMeta extends Omit<FileStatWithMetadata, 'children' | 'resource'> {
  resource: string;
  children?: FileMeta[];
}

interface DirectoryModel extends IContentsModel {
  type: 'directory';
  content: IContentsModel[];
}

@singleton({ token: FileService })
export class JupyterFileService extends FileService {
  @inject(ContentsManager) protected readonly contentsManager: ContentsManager;
  // '/read'
  // '/read-dir'
  // '/mkdirp'
  // '/write'
  // '/rename'
  // '/copy'
  // '/delete'
  // '/stat'
  // '/access'
  // '/emptd-dir'
  // '/ensure-file'
  // '/ensure-link'
  // '/ensure-symlink'

  protected fileNameAlias: FileNameAlias;

  constructor(
    @inject(FileNameAlias)
    fileNameAlias: FileNameAlias,
  ) {
    super();

    this.fileNameAlias = fileNameAlias;
  }

  async write(filePath: string, content: string): Promise<string | undefined> {
    try {
      await this.contentsManager.save(filePath, {
        content,
      });
      return filePath;
    } catch (_e) {
      //
    }
    return undefined;
  }

  async readDir(dirPath: string): Promise<DirItem[]> {
    let children: DirItem[] = [];
    try {
      const res = await this.contentsManager.get(dirPath, { type: 'directory' });
      if (res && this.isDirectory(res)) {
        const content = res.content;
        children = content.map((item) => {
          return [item.path, this.isDirectory(item) ? 2 : 1];
        });
      }
    } catch (_e) {
      //
    }
    return children;
  }
  async read(filePath: string): Promise<string | undefined> {
    let content: string | undefined = undefined;
    try {
      const res = await this.contentsManager.get(filePath);
      if (res && !this.isDirectory(res)) {
        content = res.content as string;
      }
    } catch (_e) {
      //
    }
    return content;
  }

  protected async doResolve(filePath: string): Promise<FileMeta | undefined> {
    let stat: FileMeta | undefined = undefined;
    try {
      const res = await this.contentsManager.get(filePath);
      stat = this.toFileMeta(res);
    } catch (_e) {
      //
    }
    return stat;
  }

  protected isDirectory(model: IContentsModel): model is DirectoryModel {
    if (model.type === 'directory') {
      return true;
    }
    return false;
  }

  protected toFileMeta(model: IContentsModel): FileMeta {
    const isDirectory = model.type === 'directory';
    const isSymbolicLink = model.type === 'symlink';
    let children = undefined;
    if (isDirectory) {
      const content = model.content as IContentsModel[];
      children = content?.map((item) => this.toFileMeta(item));
    }
    const uri = URI.withScheme(new URI(model.path), 'file');
    return {
      resource: uri.path.toString(),
      etag: uri.path.toString(),
      name: uri.displayName,
      mtime: new Date(model.last_modified).getTime(),
      ctime: new Date(model.created).getTime(),
      size: model.size!,
      isDirectory,
      isSymbolicLink,
      isFile: !isSymbolicLink && !isDirectory,
      children,
    };
  }

  override async copy(
    source: URI,
    _target: URI,
    _options?: CopyFileOptions,
  ): Promise<FileStatWithMetadata> {
    return this.resolve(source);
  }
  override async move(
    source: URI,
    _target: URI,
    _options?: MoveFileOptions,
  ): Promise<FileStatWithMetadata> {
    return this.resolve(source);
  }

  toFileStatMeta(meta: FileMeta): FileStatWithMetadata {
    const uri = URI.withScheme(new URI(meta.resource), 'file');

    return {
      ...meta,
      resource: uri,
      name: this.fileNameAlias.get(uri) ?? meta.name,
      children: meta.children?.map((child) => this.toFileStatMeta(child)),
    };
  }

  override async resolve(
    resource: URI,
    _options?: ResolveFileOptions | undefined,
  ): Promise<FileStatWithMetadata> {
    const resolved = await this.doResolve(resource.path.toString());
    if (resolved) {
      return this.toFileStatMeta(resolved);
    }
    return {
      resource,
      name: resource.path.base,
      mtime: 0,
      ctime: 0,
      etag: '',
      size: 0,
      isFile: false,
      isDirectory: false,
      isSymbolicLink: false,
    };
  }
}
