import type {
  EditorWidgetContribution,
  IPosition,
  IRange,
  IContentWidgetPosition,
  ISelection,
  ContentWidget,
} from '@difizen/libro-code-editor';
import { DisposableCollection, singleton } from '@difizen/mana-app';
import { editor } from '@difizen/monaco-editor-core';
import ReactDOMClient from 'react-dom/client';

import type { MonacoEditorType } from '../types.js';

import { AIWidgetComponent as AIWidget } from './widget-card/index.js';

export interface ShowAIContentOptions {
  selection?: ISelection;
  position?: IPosition;
}

export type PlaceHolderContent = string | HTMLElement | undefined;

@singleton()
export class InlineContentWidget implements ContentWidget {
  id = 'editor.widget.ReactInlineContentWidget';

  protected toDispose: DisposableCollection = new DisposableCollection();

  allowEditorOverflow = false;

  suppressMouseDown = false;

  positionPreference: editor.ContentWidgetPositionPreference[] = [
    editor.ContentWidgetPositionPreference.BELOW,
  ];

  protected editor: MonacoEditorType;

  protected placeholder: PlaceHolderContent;

  private _isHidden: boolean;
  public get isHidden(): boolean {
    return this._isHidden;
  }

  protected domNode: HTMLDivElement;

  protected options: ShowAIContentOptions | undefined;

  constructor(
    protected readonly monacoEditor: MonacoEditorType,
    protected readonly widgetProvider: EditorWidgetContribution,
  ) {
    this.editor = monacoEditor;
    this.editor?.onDidChangeCursorSelection(() => this.onDidChangeCursorSelection());
  }

  renderView() {
    return (
      <AIWidget
        operationList={this.widgetProvider.getActionButtons()}
        onActionClick={(actionId: string) => {
          const handler = this.widgetProvider.getActionHandler(actionId);
          const selection = this.editor.getSelection();
          if (!selection) {
            return;
          }
          const code = this.editor.getModel()?.getValueInRange(selection);
          handler.execute(code);
          this.editor.removeContentWidget(this);
        }}
        onClose={() => {
          this.editor.removeContentWidget(this);
        }}
      />
    );
  }

  getSelection = () => {
    const selection = {
      start: {
        line: this.editor?.getSelection()?.startLineNumber || 1,
        column: this.editor?.getSelection()?.startColumn || 1,
      } as IPosition,
      end: {
        line: this.editor?.getSelection()?.endLineNumber || 1,
        column: this.editor?.getSelection()?.endColumn || 1,
      } as IPosition,
    };
    return selection;
  };

  protected toMonacoRange(range: IRange) {
    const selection = range ?? this.getSelection();
    const monacoSelection = {
      startLineNumber: selection.start.line || 1,
      startColumn: selection.start.column || 1,
      endLineNumber: selection.end.line || 1,
      endColumn: selection.end.column || 1,
    };
    return monacoSelection;
  }

  update(placeholder: PlaceHolderContent) {
    if (this.disposed) {
      return;
    }
    this.placeholder = placeholder;
    this.onDidChangeCursorSelection();
  }

  onDidChangeCursorSelection() {
    const isEqual =
      this.getSelection().start.column === this.getSelection().end.column &&
      this.getSelection().start.line === this.getSelection().end.line;

    if (isEqual) {
      this.editor.removeContentWidget(this);
    } else {
      this.editor.addContentWidget(this);
    }
  }

  setPositionPreference(preferences: editor.ContentWidgetPositionPreference[]): void {
    this.positionPreference = preferences;
  }

  setOptions(options?: ShowAIContentOptions | undefined): void {
    this.options = options;
  }

  show(options?: ShowAIContentOptions | undefined): void {
    if (!options) {
      return;
    }

    if (
      this.options &&
      this.options.selection &&
      this.options.selection.equalsSelection(options.selection!)
    ) {
      return;
    }

    this.setOptions(options);
    this._isHidden = false;
    this.editor.addContentWidget(this);
  }

  hide() {
    this._isHidden = true;
    this.editor.removeContentWidget(this);
  }

  resume(): void {
    if (this._isHidden) {
      this._isHidden = false;
      this.editor.addContentWidget(this);
    }
  }

  getId(): string {
    return this.id;
  }

  layoutContentWidget(): void {
    this.editor.layoutContentWidget(this);
  }

  getClassName(): string {
    return this.getId();
  }

  getDomNode(): HTMLElement {
    if (!this.domNode) {
      this.domNode = document.createElement('div');
      this.domNode.style.width = 'max-content';
      this.domNode.addEventListener('click', () => {
        this.editor.focus();
      });
    }

    const root = ReactDOMClient.createRoot(this.domNode);
    root.render(this.renderView());
    // this.layoutContentWidget();

    return this.domNode;
  }

  getPosition(): IContentWidgetPosition | null {
    const cursor = this.editor.getPosition();

    if (!cursor) {
      return null;
    }
    return {
      position: {
        lineNumber: cursor.lineNumber,
        column: cursor.column,
      },
      preference: [
        editor.ContentWidgetPositionPreference.ABOVE,
        editor.ContentWidgetPositionPreference.BELOW,
      ],
    };
  }

  getMiniMapWidth(): number {
    return this.editor.getLayoutInfo().minimap.minimapWidth;
  }

  disposed = false;
  dispose() {
    if (this.disposed) {
      return;
    }
    this.toDispose.dispose();
    this.editor.removeContentWidget(this);
    this.disposed = true;
  }
}
