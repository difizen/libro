import type { Event } from '../../common/index.js';
import { URI, Priority } from '../../common/index.js';
import { Emitter, Disposable } from '../../common/index.js';
import { ApplicationContribution } from '../../mana-core/index.js';
import type { Contribution } from '../../mana-syringe/index.js';
import {
  contrib,
  postConstruct,
  singleton,
  Syringe,
} from '../../mana-syringe/index.js';
import fileIcons from 'file-icons-js';

export type ResourceLabelFormatter = {
  scheme: string;
  authority?: string;
  priority?: boolean;
  formatting: ResourceLabelFormatting;
};

export type ResourceLabelFormatting = {
  label: string; // myLabel:/${path}
  separator: '/' | '\\' | '';
  normalizeDriveLetter?: boolean;
  authorityPrefix?: string;
};

/**
 * @internal don't export it, use `LabelProvider.folderIcon` instead.
 */
const DEFAULT_FOLDER_ICON = 'fa fa-folder default-folder-icon';
/**
 * @internal don't export it, use `LabelProvider.fileIcon` instead.
 */
const DEFAULT_FILE_ICON = 'fa fa-file default-file-icon';

export const LabelProviderContribution = Syringe.defineToken(
  'LabelProviderContribution',
);
/**
 * A {@link LabelProviderContribution} determines how specific elements/nodes are displayed in the workbench.
 * Mana views use a common {@link LabelProvider} to determine the label and/or an icon for elements shown in the UI. This includes elements in lists
 * and trees, but also view specific locations like headers. The common {@link LabelProvider} collects all {@links LabelProviderContribution} and delegates
 * to the contribution with the highest priority. This is determined via calling the {@link LabelProviderContribution.canHandle} function, so contributions
 * define which elements they are responsible for.
 * As arbitrary views can consume LabelProviderContributions, they must be generic for the covered element type, not view specific. Label providers and
 * contributions can be used for arbitrary element and node types, e.g. for markers or domain-specific elements.
 */
export interface LabelProviderContribution<T = any> {
  /**
   * Determines whether this contribution can handle the given element and with what priority.
   * All contributions are ordered by the returned number if greater than zero. The highest number wins.
   * If two or more contributions return the same positive number one of those will be used. It is undefined which one.
   */
  canHandle: (element: Record<string, unknown>) => number;

  /**
   * returns an icon class for the given element.
   */
  getIcon?: (element: T) => string | undefined;

  /**
   * returns a short name for the given element.
   */
  getName?: (element: T) => string | undefined;

  /**
   * returns a long name for the given element.
   */
  getLongName?: (element: T) => string | undefined;

  /**
   * returns an icon component for the given element.
   */
  getIconComponent?: (element: T) => React.ReactNode;

  /**
   * returns an name component for the given element.
   */
  getNameComponent?: (element: T) => React.ReactNode;

  /**
   * returns an description component for the given element.
   */
  getDescriptionComponent?: (element: T) => React.ReactNode;

  /**
   * Emit when something has changed that may result in this label provider returning a different
   * value for one or more properties (name, icon etc).
   */
  readonly onDidChange?: Event<DidChangeLabelEvent>;

  /**
   * Checks whether the given element is affected by the given change event.
   * Contributions delegating to the label provider can use this hook
   * to perform a recursive check.
   */
  affects?: (element: T, event: DidChangeLabelEvent) => boolean;
}

export type DidChangeLabelEvent = {
  affects: (element: Record<string, unknown>) => boolean;
};

export type URIIconReference = {
  kind: 'uriIconReference';
  id: 'file' | 'folder';
  uri?: URI | undefined;
};

export namespace URIIconReference {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function is(element: any | undefined): element is URIIconReference {
    return (
      !!element &&
      typeof element === 'object' &&
      'kind' in element &&
      element.kind === 'uriIconReference'
    );
  }
  export function create(id: URIIconReference['id'], uri?: URI): URIIconReference {
    return { kind: 'uriIconReference', id, uri };
  }
}

@singleton({ contrib: LabelProviderContribution })
export class DefaultUriLabelProviderContribution
  implements LabelProviderContribution<Record<string, unknown>>
{
  protected formatters: ResourceLabelFormatter[] = [];
  protected readonly onDidChangeEmitter = new Emitter<DidChangeLabelEvent>();
  protected homePath: string | undefined = '/';

  @postConstruct()
  init(): void {
    //
  }

  canHandle(element: Record<string, unknown>): number {
    if (element instanceof URI || URIIconReference.is(element)) {
      return 1;
    }
    return 0;
  }

  getIcon(element: Record<string, unknown>): string {
    if (URIIconReference.is(element) && element.id === 'folder') {
      return this.defaultFolderIcon;
    }
    const uri = URIIconReference.is(element) ? element.uri : element;
    if (uri) {
      const iconClass = uri && this.getFileIcon(uri as URI);
      return iconClass || this.defaultFileIcon;
    }
    return '';
  }

  get defaultFolderIcon(): string {
    return DEFAULT_FOLDER_ICON;
  }

  get defaultFileIcon(): string {
    return DEFAULT_FILE_ICON;
  }

  protected getFileIcon(uri: URI): string | undefined {
    const fileIcon = fileIcons.getClassWithColor(uri.displayName);
    if (!fileIcon) {
      return undefined;
    }
    return `${fileIcon} mana-file-icons-js`;
  }

  getName(element: Record<string, unknown>): string | undefined {
    const uri = this.getUri(element as URI | URIIconReference);
    return uri && uri.displayName;
  }

  getLongName(element: Record<string, unknown>): string | undefined {
    const uri = this.getUri(element as URI | URIIconReference);
    if (uri) {
      const formatting = this.findFormatting(uri);
      if (formatting) {
        return this.formatUri(uri, formatting);
      }
    }
    return uri && uri.path.toString();
  }

  protected getUri(element: URI | URIIconReference): URI | undefined {
    return URIIconReference.is(element) ? element.uri : element;
  }

  registerFormatter(formatter: ResourceLabelFormatter): Disposable {
    this.formatters.push(formatter);
    this.fireOnDidChange();
    return Disposable.create(() => {
      this.formatters = this.formatters.filter((f) => f !== formatter);
      this.fireOnDidChange();
    });
  }

  get onDidChange(): Event<DidChangeLabelEvent> {
    return this.onDidChangeEmitter.event;
  }

  private fireOnDidChange(): void {
    this.onDidChangeEmitter.fire({
      affects: (element: Record<string, unknown>) => this.canHandle(element as any) > 0,
    });
  }

  // copied and modified from https://github.com/microsoft/vscode/blob/1.44.2/src/vs/workbench/services/label/common/labelService.ts
  /*---------------------------------------------------------------------------------------------
   *  Copyright (c) Microsoft Corporation. All rights reserved.
   *  Licensed under the MIT License. See License.txt in the project root for license information.
   *--------------------------------------------------------------------------------------------*/
  private readonly labelMatchingRegexp = /\${(scheme|authority|path|query)}/g;
  protected formatUri(resource: URI, formatting: ResourceLabelFormatting): string {
    let label = formatting.label.replace(this.labelMatchingRegexp, (_match, token) => {
      switch (token) {
        case 'scheme':
          return resource.scheme;
        case 'authority':
          return resource.authority;
        case 'path':
          return resource.path.toString();
        case 'query':
          return resource.query;
        default:
          return '';
      }
    });

    // convert \c:\something => C:\something
    if (formatting.normalizeDriveLetter && this.hasDriveLetter(label)) {
      label = label.charAt(1).toUpperCase() + label.substr(2);
    }

    if (formatting.authorityPrefix && resource.authority) {
      label = formatting.authorityPrefix + label;
    }

    return label.replace(/\//g, formatting.separator);
  }

  private hasDriveLetter(path: string): boolean {
    return !!(path && path[2] === ':');
  }

  protected findFormatting(resource: URI): ResourceLabelFormatting | undefined {
    let bestResult: ResourceLabelFormatter | undefined;

    this.formatters.forEach((formatter) => {
      if (formatter.scheme === resource.scheme) {
        if (!bestResult && !formatter.authority) {
          bestResult = formatter;
          return;
        }
        if (!formatter.authority) {
          return;
        }

        if (
          formatter.authority.toLowerCase() === resource.authority.toLowerCase() &&
          (!bestResult ||
            !bestResult.authority ||
            formatter.authority.length > bestResult.authority.length ||
            (formatter.authority.length === bestResult.authority.length &&
              formatter.priority))
        ) {
          bestResult = formatter;
        }
      }
    });

    return bestResult ? bestResult.formatting : undefined;
  }
}

/**
 * The {@link LabelProvider} determines how elements/nodes are displayed in the workbench. For any element, it can determine a short label, a long label
 * and an icon. The {@link LabelProvider} is to be used in lists, trees and tables, but also view specific locations like headers.
 * The common {@link LabelProvider} can be extended/adapted via {@link LabelProviderContribution}s. For every element, the {@links LabelProvider} will determine the
 * {@link LabelProviderContribution} with the hightest priority and delegate to it. Mana registers default {@link LabelProviderContribution} for common types, e.g.
 * the {@link DefaultUriLabelProviderContribution} for elements that have a URI.
 * Using the {@link LabelProvider} across the workbench ensures a common look and feel for elements across multiple views. To adapt the way how specific
 * elements/nodes are rendered, use a {@link LabelProviderContribution} rather than adapting or sub classing the {@link LabelProvider}. This way, your adaptation
 * is applied to all views in Mana that use the {@link LabelProvider}
 */
@singleton({ contrib: ApplicationContribution })
export class LabelProvider implements ApplicationContribution {
  protected readonly onDidChangeEmitter = new Emitter<DidChangeLabelEvent>();
  protected readonly contributionProvider: Contribution.Provider<LabelProviderContribution>;
  constructor(
    @contrib(LabelProviderContribution)
    contributionProvider: Contribution.Provider<LabelProviderContribution>,
  ) {
    this.contributionProvider = contributionProvider;
  }

  /**
   * Start listening to contributions.
   *
   * Don't call this method directly!
   * It's called by the frontend application during initialization.
   */
  initialize(): void {
    const contributions = this.contributionProvider.getContributions();
    for (const eventContribution of contributions) {
      if (eventContribution.onDidChange) {
        eventContribution.onDidChange((event: DidChangeLabelEvent) => {
          this.onDidChangeEmitter.fire({
            affects: (element: Record<string, any>) => this.affects(element, event),
          });
        });
      }
    }
  }

  protected affects(element: Record<string, any>, event: DidChangeLabelEvent): boolean {
    if (event.affects(element)) {
      return true;
    }
    for (const contribution of this.findContribution(element)) {
      if (contribution.affects && contribution.affects(element, event)) {
        return true;
      }
    }
    return false;
  }

  get onDidChange(): Event<DidChangeLabelEvent> {
    return this.onDidChangeEmitter.event;
  }

  /**
   * Return a default file icon for the current icon theme.
   */
  get fileIcon(): string {
    return this.getIcon(URIIconReference.create('file'));
  }

  /**
   * Return a default folder icon for the current icon theme.
   */
  get folderIcon(): string {
    return this.getIcon(URIIconReference.create('folder'));
  }

  /**
   * Get the icon class from the list of available {@link LabelProviderContribution} for the given element.
   * @return the icon class
   */
  getIcon(element: Record<any, any>): string {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value = contribution.getIcon && contribution.getIcon(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '';
  }

  /**
   * Get a short name from the list of available {@link LabelProviderContribution} for the given element.
   * @return the short name
   */
  getName(element: Record<any, any>): string {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value = contribution.getName && contribution.getName(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '<unknown>';
  }

  /**
   * Get a long name from the list of available {@link LabelProviderContribution} for the given element.
   * @return the long name
   */
  getLongName(element: Record<any, any>): string {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value = contribution.getLongName && contribution.getLongName(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '';
  }

  /**
   * Get a icon component from the list of available {@link LabelProviderContribution} for the given element.
   * @return the icon component
   */
  getIconCompomponent(element: Record<any, any>): React.ReactNode {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value =
        contribution.getIconComponent && contribution.getIconComponent(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return null;
  }

  /**
   * Get a name component from the list of available {@link LabelProviderContribution} for the given element.
   * @return the name component
   */
  getNameComponent(element: Record<any, any>): React.ReactNode {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value =
        contribution.getNameComponent && contribution.getNameComponent(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return '<unknown>';
  }

  /**
   * Get a description component from the list of available {@link LabelProviderContribution} for the given element.
   * @return the description component
   */
  getDescriptionComponent(element: Record<any, any>): React.ReactNode {
    const contributions = this.findContribution(element);
    for (const contribution of contributions) {
      const value =
        contribution.getDescriptionComponent &&
        contribution.getDescriptionComponent(element);
      if (value === undefined) {
        continue;
      }
      return value;
    }
    return null;
  }

  protected findContribution(element: Record<any, any>): LabelProviderContribution[] {
    const prioritized = Priority.sortSync(
      this.contributionProvider.getContributions(),
      (contribution: { canHandle: (arg0: Record<any, any>) => any }) =>
        contribution.canHandle(element),
    );
    return prioritized.map((c: { value: any }) => c.value);
  }
}
