import type { Disposable } from '@difizen/libro-common/app';
import { DisposableCollection } from '@difizen/libro-common/app';
import { editor } from '@difizen/monaco-editor-core';

import type { MonacoEditorType } from './types.js';

export type PlaceHolderContent = string | HTMLElement | undefined;

/**
 * Represents an placeholder renderer for monaco editor
 * Roughly based on https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/codeEditor/browser/untitledTextEditorHint/untitledTextEditorHint.ts
 */
export class PlaceholderContentWidget implements Disposable {
  static ID = 'editor.widget.placeholderHint';

  protected placeholder: PlaceHolderContent;

  protected editor: MonacoEditorType;

  protected domNode: HTMLDivElement;

  protected toDispose: DisposableCollection = new DisposableCollection();

  constructor(placeholder: PlaceHolderContent, monacoEditor: MonacoEditorType) {
    this.placeholder = placeholder;
    this.editor = monacoEditor;
    // register a listener for editor code changes
    this.editor.onDidChangeModelContent(() => this.onDidChangeModelContent());
    // ensure that on initial load the placeholder is shown
    this.onDidChangeModelContent();
  }

  onDidChangeModelContent() {
    if (this.editor.getValue() === '') {
      this.editor.addContentWidget(this);
    } else {
      this.editor.removeContentWidget(this);
    }
  }

  update(placeholder: PlaceHolderContent) {
    if (this.disposed) {
      return;
    }
    this.placeholder = placeholder;
    this.onDidChangeModelContent();
  }

  getId() {
    return PlaceholderContentWidget.ID;
  }

  getDomNode() {
    if (!this.domNode) {
      this.domNode = document.createElement('div');
      this.domNode.style.width = 'max-content';
      this.domNode.style.pointerEvents = 'none';
      this.domNode.style.opacity = '60%';
      this.domNode.addEventListener('click', () => {
        this.editor.focus();
      });

      const content =
        typeof this.placeholder === 'string'
          ? document.createTextNode(this.placeholder)
          : this.placeholder;

      if (content) {
        this.domNode.appendChild(content);
      }
      this.domNode.style.fontStyle = 'italic';
      if (typeof content === 'string') {
        this.domNode.setAttribute('aria-label', 'placeholder ' + content);
      } else {
        this.domNode.setAttribute('aria-hidden', 'true');
      }
      this.editor.applyFontInfo(this.domNode);
    }

    return this.domNode;
  }

  getPosition() {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [editor.ContentWidgetPositionPreference.EXACT],
    };
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
