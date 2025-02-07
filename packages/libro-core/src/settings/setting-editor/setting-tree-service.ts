import { inject, ConfigurationRegistry, URI } from '@difizen/libro-common/app';
import { FileService, singleton } from '@difizen/libro-common/app';
import type { FileStatWithMetadata } from '@difizen/libro-common/app';

const defaultFileMeta = {
  mtime: 0,
  ctime: 0,
  etag: '',
  size: 0,
  isFile: false,
  isDirectory: false,
  isSymbolicLink: false,
};

@singleton({ contrib: FileService })
export class SettingTreeService extends FileService {
  protected readonly configurationRegistry: ConfigurationRegistry;
  constructor(
    @inject(ConfigurationRegistry) configurationRegistry: ConfigurationRegistry,
  ) {
    super();
    this.configurationRegistry = configurationRegistry;
  }

  override async resolve(
    resource: URI,
    // options?: ResolveFileOptions | undefined,
  ): Promise<FileStatWithMetadata> {
    if (resource.path.isRoot) {
      const roots = this.configurationRegistry.getRootNamespaces().map((item) => {
        return {
          ...defaultFileMeta,
          isFile: false,
          isDirectory: true,
          name: item,
          resource: URI.resolve(resource, item),
        };
      });
      return {
        ...defaultFileMeta,
        isDirectory: true,
        name: resource.displayName,
        resource,
        children: roots,
      };
    }

    const name = resource.path.name;

    const namespaces = this.configurationRegistry
      .getChildNamespaces([name])
      .map((item) => {
        return {
          ...defaultFileMeta,
          isFile: false,
          isDirectory: true,
          name: item.join('.'),
          resource: URI.resolve(resource, item.join('.')),
        };
      });

    const configs = this.configurationRegistry
      .getConfigurationByNamespace([name])
      .map((item) => {
        return {
          ...defaultFileMeta,
          isFile: true,
          name: item.title ?? '',
          resource: URI.resolve(resource, item.id),
        };
      });

    return {
      ...defaultFileMeta,
      isFile: false,
      isDirectory: true,
      name: resource.displayName,
      resource,
      children: [...namespaces, ...configs],
    };
  }
}
