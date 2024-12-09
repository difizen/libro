import type { MaybePromise } from '@difizen/mana-app';
import { Syringe } from '@difizen/mana-app';

import type { IPosition, ISelection } from '../code-editor-protocol.js';
import type { CancellationToken } from '../index.js';

export const EditorWidgetContribution = Syringe.defineToken('EditorWidgetContribution');
export interface EditorWidgetContribution {
  canHandle: () => number;
  commandMap: Map<string, WidgetActionItem>;
  handlerMap: Map<string, WidgetActionHandlerItem>;
  getActionButtons: () => WidgetActionItem[];
  getActionHandler: (actionId: string) => WidgetActionHandlerItem | undefined;
}

export type WidgetActionHandlerItem = BaseInlineHandler<
  [code: string, token: CancellationToken]
>;

export interface BaseInlineHandler<T extends any[]> {
  /**
   * 直接执行 action 的操作，点击后 inline chat 立即消失
   */
  execute?: (...args: T) => MaybePromise<void>;
  /**
   * 在 editor 里预览输出的结果
   */
  providePreviewStrategy?: (...args: T) => MaybePromise<any>;
}

export interface WidgetActionItem {
  /**
   * 唯一标识的 id
   */
  id: string;
  /**
   * 用于展示的名称
   */
  name: string;
  /**
   * hover 上去的 popover 提示
   */
  title?: string;
  renderType?: WidgetActionRenderType;
  /**
   * 排序
   */
  order?: number;

  /**
   * Show in code action list, default is not show
   * Only support editor inline chat now
   * @example {}
   */
  codeAction?: CodeActionItem;
}

export interface CodeActionItem {
  title?: string;
  kind?: string;
  isPreferred?: boolean;
  disabled?: string;
}

export type WidgetActionRenderType = 'button' | 'dropdown';

export interface IInlineContentWidget extends ContentWidget {
  show: (options?: ShowAIContentOptions | undefined) => void;
  hide: (options?: ShowAIContentOptions | undefined) => void;
}

export interface ShowAIContentOptions {
  selection?: ISelection;
  position?: IPosition;
}

export interface ContentWidget {
  /**
   * Render this content widget in a location where it could overflow the editor's view dom node.
   */
  allowEditorOverflow?: boolean;
  /**
   * Call preventDefault() on mousedown events that target the content widget.
   */
  suppressMouseDown?: boolean;
  /**
   * Get a unique identifier of the content widget.
   */
  getId(): string;
  /**
   * Get the dom node of the content widget.
   */
  getDomNode(): HTMLElement;
  /**
   * Get the placement of the content widget.
   * If null is returned, the content widget will be placed off screen.
   */
  getPosition(): IContentWidgetPosition | null;
  /**
   * Optional function that is invoked before rendering
   * the content widget. If a dimension is returned the editor will
   * attempt to use it.
   */
  beforeRender?(): IDimension | null;
  /**
   * Optional function that is invoked after rendering the content
   * widget. Is being invoked with the selected position preference
   * or `null` if not rendered.
   */
  afterRender?(position: ContentWidgetPositionPreference | null): void;
}

export interface IDimension {
  width: number;
  height: number;
}

/**
 * A position for rendering content widgets.
 */
export interface IContentWidgetPosition {
  /**
   * Desired position which serves as an anchor for placing the content widget.
   * The widget will be placed above, at, or below the specified position, based on the
   * provided preference. The widget will always touch this position.
   *
   * Given sufficient horizontal space, the widget will be placed to the right of the
   * passed in position. This can be tweaked by providing a `secondaryPosition`.
   *
   * @see preference
   * @see secondaryPosition
   */
  position: IPosition | null;
  /**
   * Optionally, a secondary position can be provided to further define the placing of
   * the content widget. The secondary position must have the same line number as the
   * primary position. If possible, the widget will be placed such that it also touches
   * the secondary position.
   */
  secondaryPosition?: IPosition | null;
  /**
   * Placement preference for position, in order of preference.
   */
  preference: ContentWidgetPositionPreference[];
  /**
   * Placement preference when multiple view positions refer to the same (model) position.
   * This plays a role when injected text is involved.
   */
  positionAffinity?: PositionAffinity;
}

/**
 * A positioning preference for rendering content widgets.
 */
export declare enum ContentWidgetPositionPreference {
  /**
   * Place the content widget exactly at a position
   */
  EXACT = 0,
  /**
   * Place the content widget above a position
   */
  ABOVE = 1,
  /**
   * Place the content widget below a position
   */
  BELOW = 2,
}

export declare enum PositionAffinity {
  /**
   * Prefers the left most position.
   */
  Left = 0,
  /**
   * Prefers the right most position.
   */
  Right = 1,
  /**
   * No preference.
   */
  None = 2,
  /**
   * If the given position is on injected text, prefers the position left of it.
   */
  LeftOfInjectedText = 3,
  /**
   * If the given position is on injected text, prefers the position right of it.
   */
  RightOfInjectedText = 4,
}
