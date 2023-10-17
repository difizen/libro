import type { SourceChange } from '@difizen/libro-shared-model';
import { Syringe } from '@difizen/mana-app';
import type { View } from '@difizen/mana-app';
import type { Event } from '@difizen/mana-app';
import type React from 'react';

import type { IEditor } from '../code-editor.js';

/**
 * The context which will be passed to the `fetch` function
 * of a provider.
 */
export interface CompletionContext {
  /**
   * The widget (notebook, console, code editor) which invoked
   * the completer
   */
  widget: View;

  /**
   * The current editor.
   */
  editor?: IEditor | null;

  /**
   * The session extracted from widget for convenience.
   */
  // session?: ISessionConnection | null;
}

/**
 * An object describing a completion option injection into text.
 */
export interface IPatch {
  /**
   * The start of the range to be patched.
   */
  start: number;

  /**
   * The end of the range to be patched.
   */
  end: number;

  /**
   * The value to be patched in.
   */
  value: string;
}

/**
 * Completion item object based off of LSP CompletionItem.
 * Compared to the old kernel completions interface, this enhances the completions UI to support:
 * - differentiation between inserted text and user facing text
 * - documentation for each completion item to be displayed adjacently
 * - deprecation styling
 * - custom icons
 * and other potential new features.
 */
export interface ICompletionItem {
  /**
   * User facing completion.
   * If insertText is not set, this will be inserted.
   */
  label: string;

  /**
   * Completion to be inserted.
   */
  insertText?: string;

  /**
   * Type of this completion item.
   */
  type?: string;

  /**
   * LabIcon object for icon to be rendered with completion type.
   */
  icon?: React.ReactNode;

  /**
   * A human-readable string with additional information
   * about this item, like type or symbol information.
   */
  documentation?: string;

  /**
   * Indicates if the item is deprecated.
   */
  deprecated?: boolean;

  resolve?: (patch?: IPatch) => Promise<ICompletionItem>;
}

/**
 * A reply to a completion items fetch request.
 */
export interface ICompletionItemsReply<T extends ICompletionItem = ICompletionItem> {
  /**
   * The starting index for the substring being replaced by completion.
   */
  start: number;
  /**
   * The end index for the substring being replaced by completion.
   */
  end: number;
  /**
   * A list of completion items. default to CompletionHandler.ICompletionItems
   */
  items: T[];
}

/**
 * The details of a completion request.
 */
export interface IRequest {
  /**
   * The cursor offset position within the text being completed.
   */
  offset: number;

  /**
   * The text being completed.
   */
  text: string;
}

export const CompletionProvider = new Syringe.DefinedToken('CompletionProvider');

/**
 * The interface to implement a completer provider.
 */
export interface CompletionProvider<T extends ICompletionItem = ICompletionItem> {
  /**
   * Unique identifier of the provider
   */
  readonly identifier: string;

  /**
   * Renderer for provider's completions (optional).
   */
  // readonly renderer?: Completer.IRenderer | null;

  /**
   * Is completion provider applicable to specified context?
   * @param request - the completion request text and details
   * @param context - additional information about context of completion request
   */
  isApplicable: (context: CompletionContext) => Promise<boolean>;

  /**
   * Fetch completion requests.
   *
   * @param request - the completion request text and details
   * @param context - additional information about context of completion request
   */
  fetch: (
    request: IRequest,
    context: CompletionContext,
  ) => Promise<ICompletionItemsReply<T>>;

  /**
   * This method is called to customize the model of a completer widget.
   * If it is not provided, the default model will be used.
   *
   * @param context - additional information about context of completion request
   * @returns The completer model
   */
  modelFactory?: (context: CompletionContext) => Promise<Record<string, any>>;

  /**
   * Given an incomplete (unresolved) completion item, resolve it by adding
   * all missing details, such as lazy-fetched documentation.
   *
   * @param completion - the completion item to resolve
   * @param context - The context of the completer
   * @param patch - The text which will be injected if the completion item is
   * selected.
   */
  resolve?: (
    completionItem: T,
    context: CompletionContext,
    patch?: IPatch | null,
  ) => Promise<T>;

  /**
   * If users enable `autoCompletion` in setting, this method is
   * called on text changed event of `CodeMirror` to check if the
   * completion items should be shown.
   *
   * @param  completerIsVisible - Current visibility status of the
   *  completer widget0
   * @param  changed - changed text.
   */
  shouldShowContinuousHint?: (
    completerIsVisible: boolean,
    changed: SourceChange,
  ) => boolean;
}

export interface ICompletionProviderManager {
  /**
   * Register a completer provider with the manager.
   *
   * @param {CompletionProvider} provider - the provider to be registered.
   */
  registerProvider: (provider: CompletionProvider) => void;

  /**
   * Invoke the completer in the widget with provided id.
   *
   * @param {string} id - the id of notebook panel, console panel or code editor.
   */
  invoke: (id: string) => void;

  /**
   * Activate `select` command in the widget with provided id.
   *
   * @param {string} id - the id of notebook panel, console panel or code editor.
   */
  select: (id: string) => void;

  /**
   * Update completer handler of a widget with new context.
   *
   * @param newCompleterContext - The completion context.
   */
  updateCompleter: (newCompleterContext: CompletionContext) => Promise<void>;

  /**
   * Signal emitted when active providers list is changed.
   */
  activeProvidersChanged: Event<void>;
}

export interface IConnectorProxy {
  /**
   * Fetch response from multiple providers, If a provider can not return
   * the response for a completer request before timeout,
   * the result of this provider will be ignore.
   *
   * @param {CompletionHandler.IRequest} request - The completion request.
   */
  fetch: (request: IRequest) => Promise<(ICompletionItemsReply | null)[]>;

  /**
   * Check if completer should make request to fetch completion responses
   * on user typing. If the provider with highest rank does not have
   * `shouldShowContinuousHint` method, a default one will be used.
   *
   * @param completerIsVisible - The visible status of completer widget.
   * @param changed - CodeMirror changed argument.
   */
  shouldShowContinuousHint: (
    completerIsVisible: boolean,
    changed: SourceChange,
  ) => boolean;
}
