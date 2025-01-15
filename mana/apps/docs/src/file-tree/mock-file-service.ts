/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FileStatWithMetadata, ResolveFileOptions } from '@difizen/mana-app';
import { singleton, URI } from '@difizen/mana-app';
import { FileService } from '@difizen/mana-app';

const defaultFileMeta = {
  mtime: 0,
  ctime: 0,
  etag: '',
  size: 0,
  isFile: false,
  isDirectory: false,
  isSymbolicLink: false,
};
@singleton()
export class MockFileService extends FileService {
  override async resolve(
    resource: URI,
    options?: ResolveFileOptions | undefined,
  ): Promise<FileStatWithMetadata> {
    if (resource.path.isRoot) {
      return {
        ...defaultFileMeta,
        isDirectory: true,
        name: resource.displayName,
        resource,
        children: [
          {
            ...defaultFileMeta,
            isFile: true,
            name: 'a.sql',
            resource: URI.resolve(resource, 'a.sql'),
          },
          {
            ...defaultFileMeta,
            isFile: true,
            name: 'b.py',
            resource: URI.resolve(resource, 'b.py'),
          },
          {
            ...defaultFileMeta,
            isFile: true,
            name: 'c.ipynb',
            resource: URI.resolve(resource, 'c.ipynb'),
          },
          {
            ...defaultFileMeta,
            isDirectory: true,
            name: 'dir',
            resource: URI.resolve(resource, 'dir'),
          },
        ],
      };
    }
    if (resource.path.name.includes('.')) {
      return {
        mtime: 0,
        ctime: 0,
        etag: '',
        size: 0,
        isFile: true,
        isDirectory: false,
        isSymbolicLink: false,
        name: resource.displayName,
        resource,
      };
    }
    return {
      mtime: 0,
      ctime: 0,
      etag: '',
      size: 0,
      isFile: false,
      isDirectory: true,
      isSymbolicLink: false,
      name: resource.displayName,
      resource,
      children: [
        {
          ...defaultFileMeta,
          isFile: true,
          name: 'a.sql',
          resource: URI.resolve(resource, 'a.sql'),
        },
        {
          ...defaultFileMeta,
          isFile: true,
          name: 'b.py',
          resource: URI.resolve(resource, 'b.py'),
        },
        {
          ...defaultFileMeta,
          isFile: true,
          name: 'c.ipynb',
          resource: URI.resolve(resource, 'c.ipynb'),
        },
        {
          ...defaultFileMeta,
          isDirectory: true,
          name: 'dir',
          resource: URI.resolve(resource, 'dir'),
        },
      ],
    };
  }
}
