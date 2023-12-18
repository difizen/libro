/**
 * This file defines the shared shared-models types.
 *
 * - Notebook Type.
 * - Notebook Metadata Types.
 * - Cell Types.
 * - Cell Metadata Types.
 *
 * It also defines the shared changes to be used in the events.
 */

import type {
  INotebookMetadata,
  PartialJSONValue,
  IRawCell,
  ICodeCell,
  IMarkdownCell,
  IBaseCell,
  IBaseCellMetadata,
  CellType,
  ExecutionCount,
  IOutput,
  IAttachments,
  IUnrecognizedCell,
} from '@difizen/libro-common';
import type { Disposable, Event } from '@difizen/mana-app';

/**
 * Changes on Sequence-like data are expressed as Quill-inspired deltas.
 *
 * @source https://quilljs.com/docs/delta/
 */
export type Delta<T> = { insert?: T; delete?: number; retain?: number }[];

/**
 * ISharedBase defines common operations that can be performed on any shared object.
 */
export interface ISharedBase extends Disposable {
  /**
   * Undo an operation.
   */
  undo: () => void;

  /**
   * Redo an operation.
   */
  redo: () => void;

  /**
   * Whether the object can redo changes.
   */
  canUndo: () => boolean;

  /**
   * Whether the object can undo changes.
   */
  canRedo: () => boolean;

  /**
   * Clear the change stack.
   */
  clearUndoHistory: () => void;

  /**
   * Perform a transaction. While the function f is called, all changes to the shared
   * document are bundled into a single event.
   */
  transact: (f: () => void) => void;
}

/**
 * Implement an API for Context information on the shared information.
 * This is used by, for example, docregistry to share the file-path of the edited content.
 */
export interface ISharedDocument extends ISharedBase {
  /**
   * The changed signal.
   */
  readonly changed: Event<DocumentChange>;
}

/**
 * The ISharedText interface defines models that can be bound to a text editor like CodeMirror.
 */
export interface ISharedText extends ISharedBase {
  /**
   * The changed signal.
   */
  readonly changed: Event<SourceChange>;

  /**
   * Text
   */
  source: string;

  /**
   * Get text.
   *
   * @returns Text.
   */
  getSource: () => string;

  /**
   * Set text.
   *
   * @param value New text.
   */
  setSource: (value: string) => void;

  /**
   * Replace content from `start' to `end` with `value`.
   *
   * @param start: The start index of the range to replace (inclusive).
   * @param end: The end index of the range to replace (exclusive).
   * @param value: New source (optional).
   */
  updateSource: (start: number, end: number, value?: string) => void;
}

/**
 * Text/Markdown/Code files are represented as ISharedFile
 */
export interface ISharedFile extends ISharedDocument, ISharedText {
  /**
   * The changed signal.
   */
  readonly changed: Event<FileChange>;
}

/**
 * Implements an API for INotebookContent
 */
export interface ISharedNotebook extends ISharedDocument {
  /**
   * The changed signal.
   */
  readonly undoChanged: Event<boolean>;
  /**
   * The changed signal.
   */
  readonly redoChanged: Event<boolean>;
  /**
   * The changed signal.
   */
  readonly changed: Event<NotebookChange>;

  /**
   * Signal triggered when a metadata changes.
   */
  readonly metadataChanged: Event<IMapChange>;

  /**
   * The list of shared cells in the notebook.
   */
  readonly cells: ISharedCell[];

  /**
   * Signal triggered when the cells list changes.
   */
  readonly cellsChanged: Event<IListChange>;

  /**
   * Wether the undo/redo logic should be
   * considered on the full document across all cells.
   */
  readonly disableDocumentWideUndoRedo?: boolean;

  /**
   * Notebook metadata.
   */
  metadata: INotebookMetadata;

  /**
   * The minor version number of the
   */
  readonly nbformat_minor: number;

  /**
   * The major version number of the
   */
  readonly nbformat: number;

  /**
   * Delete a metadata notebook.
   *
   * @param key The key to delete
   */
  deleteMetadata: (key: string) => void;

  /**
   * Returns some metadata associated with the notebook.
   *
   * If no `key` is provided, it will return all metadata.
   * Else it will return the value for that key.
   *
   * @param key Key to get from the metadata
   * @returns Notebook's metadata.
   */
  getMetadata: (key?: string) => INotebookMetadata;

  /**
   * Sets some metadata associated with the notebook.
   *
   * If only one argument is provided, it will override all notebook metadata.
   * Otherwise a single key will be set to a new value.
   *
   * @param metadata All Notebook's metadata or the key to set.
   * @param value New metadata value
   */
  setMetadata: (metadata: INotebookMetadata | string, value?: PartialJSONValue) => void;

  /**
   * Updates the metadata associated with the notebook.
   *
   * @param value: Metadata's attribute to update.
   */
  updateMetadata: (value: Partial<INotebookMetadata>) => void;

  /**
   * Add a shared cell at the notebook bottom.
   *
   * @param cell Cell to add.
   *
   * @returns The added cell.
   */
  addCell: (cell: SharedCell.Cell) => ISharedCell;

  /**
   * Get a shared cell by index.
   *
   * @param index: Cell's position.
   *
   * @returns The requested shared cell.
   */
  getCell: (index: number) => ISharedCell;

  /**
   * Insert a shared cell into a specific position.
   *
   * @param index Cell's position.
   * @param cell Cell to insert.
   *
   * @returns The inserted cell.
   */
  insertCell: (index: number, cell: SharedCell.Cell) => ISharedCell;

  /**
   * Insert a list of shared cells into a specific position.
   *
   * @param index Position to insert the cells.
   * @param cells Array of shared cells to insert.
   *
   * @returns The inserted cells.
   */
  insertCells: (index: number, cells: SharedCell.Cell[]) => ISharedCell[];

  /**
   * Move a cell.
   *
   * @param fromIndex: Index of the cell to move.
   *
   * @param toIndex: New position of the cell.
   */
  moveCell: (fromIndex: number, toIndex: number) => void;

  /**
   * Remove a cell.
   *
   * @param index: Index of the cell to remove.
   */
  deleteCell: (index: number) => void;

  /**
   * Remove a range of cells.
   *
   * @param from: The start index of the range to remove (inclusive).
   *
   * @param to: The end index of the range to remove (exclusive).
   */
  deleteCellRange: (from: number, to: number) => void;
}

/**
 * Definition of the map changes for yjs.
 */
export type MapChange = Map<
  string,
  { action: 'add' | 'update' | 'delete'; oldValue: any; newValue: any }
>;

/**
 * 类型转换器：将libro的cell type（string） 转换为 'code' | 'markdown' | 'raw' 三种之一
 */
export type CellTypeAdaptor = (cell_type: CellType) => 'code' | 'markdown' | 'raw';

/**
 * The namespace for `ISharedNotebook` class statics.
 */
export namespace ISharedNotebook {
  /**
   * The options used to initialize a a ISharedNotebook
   */
  export interface IOptions {
    /**
     * Wether the the undo/redo logic should be
     * considered on the full document across all cells.
     */
    disableDocumentWideUndoRedo?: boolean;

    cellTypeAdaptor?: CellTypeAdaptor;
  }
}

/** Cell Types. */
export type ISharedCell =
  | ISharedCodeCell
  | ISharedRawCell
  | ISharedMarkdownCell
  | ISharedUnrecognizedCell;

/**
 * Shared cell namespace
 */
export namespace SharedCell {
  /**
   * Cell data
   */
  export type Cell = (IRawCell | ICodeCell | IMarkdownCell | IBaseCell) & {
    cell_type: string;
  };

  /**
   * Shared cell constructor options.
   */
  export interface IOptions {
    /**
     * Optional notebook to which this cell belongs.
     *
     * If not provided the cell will be standalone.
     */
    notebook?: ISharedNotebook | undefined;
  }
}

/**
 * Implements an API for IBaseCell.
 */
export interface ISharedBaseCell<Metadata extends IBaseCellMetadata = IBaseCellMetadata>
  extends ISharedText {
  /**
   * The type of the cell.
   */
  readonly cell_type: CellType;

  /**
   * The changed signal.
   */
  readonly changed: Event<CellChange<Metadata>>;

  /**
   * Cell id.
   */
  readonly id: string;

  /**
   * Whether the cell is standalone or not.
   *
   * If the cell is standalone. It cannot be
   * inserted into a YNotebook because the Yjs model is already
   * attached to an anonymous Y.Doc instance.
   */
  readonly isStandalone: boolean;

  /**
   * Cell metadata.
   */
  metadata: Partial<Metadata>;

  /**
   * Signal triggered when the cell metadata changes.
   */
  readonly metadataChanged: Event<IMapChange>;

  /**
   * The notebook that this cell belongs to.
   */
  readonly notebook: ISharedNotebook | null;

  /**
   * Get Cell id.
   *
   * @returns Cell id.
   */
  getId: () => string;

  /**
   * Delete a metadata cell.
   *
   * @param key The key to delete
   */
  deleteMetadata: (key: string) => void;

  /**
   * Returns some metadata associated with the cell.
   *
   * If a `key` is provided, returns the metadata value.
   * Otherwise returns all metadata
   *
   * @returns Cell's metadata.
   */
  getMetadata: (key?: string) => Partial<Metadata>;

  /**
   * Sets some cell metadata.
   *
   * If only one argument is provided, it will override all cell metadata.
   * Otherwise a single key will be set to a new value.
   *
   * @param metadata Cell's metadata or key.
   * @param value Metadata value
   */
  setMetadata: (metadata: Partial<Metadata> | string, value?: PartialJSONValue) => void;

  /**
   * Serialize the model to JSON.
   */
  toJSON: () => IBaseCell;
}

/**
 * Implements an API for ICodeCell.
 */
export interface ISharedCodeCell extends ISharedBaseCell<IBaseCellMetadata> {
  /**
   * The type of the cell.
   * note: modified in for libro, code cell type maybe python\sql\javascript etc.
   */
  cell_type: string;
  // cell_type: 'code';

  /**
   * The code cell's prompt number. Will be null if the cell has not been run.
   */
  execution_count: ExecutionCount;

  /**
   * Cell outputs
   */
  outputs: IOutput[];

  /**
   * Execution, display, or stream outputs.
   */
  getOutputs: () => IOutput[];

  /**
   * Add/Update output.
   */
  setOutputs: (outputs: IOutput[]) => void;

  /**
   * Replace content from `start' to `end` with `outputs`.
   *
   * @param start: The start index of the range to replace (inclusive).
   *
   * @param end: The end index of the range to replace (exclusive).
   *
   * @param outputs: New outputs (optional).
   */
  updateOutputs: (start: number, end: number, outputs: IOutput[]) => void;

  /**
   * Serialize the model to JSON.
   */
  toJSON: () => IBaseCell;
}

/**
 * Cell with attachment interface.
 */
export interface ISharedAttachmentsCell extends ISharedBaseCell<IBaseCellMetadata> {
  /**
   * Cell attachments
   */
  attachments?: IAttachments | undefined;

  /**
   * Gets the cell attachments.
   *
   * @returns The cell attachments.
   */
  getAttachments: () => IAttachments | undefined;

  /**
   * Sets the cell attachments
   *
   * @param attachments: The cell attachments.
   */
  setAttachments: (attachments: IAttachments | undefined) => void;
}

/**
 * Implements an API for IMarkdownCell.
 */
export interface ISharedMarkdownCell extends ISharedAttachmentsCell {
  /**
   * String identifying the type of cell.
   */
  cell_type: 'markdown';

  /**
   * Serialize the model to JSON.
   */
  toJSON: () => IMarkdownCell;
}

/**
 * Implements an API for IRawCell.
 */
export interface ISharedRawCell extends ISharedAttachmentsCell {
  /**
   * String identifying the type of cell.
   */
  cell_type: 'raw';

  /**
   * Serialize the model to JSON.
   */
  toJSON: () => IRawCell;
}

/**
 * Implements an API for IUnrecognizedCell.
 */
export interface ISharedUnrecognizedCell extends ISharedBaseCell<IBaseCellMetadata> {
  /**
   * The type of the cell.
   *
   * The notebook format specified the type will not be 'markdown' | 'raw' | 'code'
   */
  cell_type: string;

  /**
   * Serialize the model to JSON.
   */
  toJSON: () => IUnrecognizedCell;
}

export type StateChange<T> = {
  /**
   * Key changed
   */
  name: string;
  /**
   * Old value
   */
  oldValue?: T;
  /**
   * New value
   */
  newValue?: T;
};

/**
 * Generic document change
 */
export type DocumentChange = {
  /**
   * The context a map => should be part of the document state map
   */
  // FIXME to remove at some point
  contextChange?: MapChange;
  /**
   * Change occurring in the document state.
   */
  stateChange?: StateChange<any>[] | undefined;
};

/**
 * The change types which occur on a list.
 */
export type ListChangeType =
  /**
   * Item(s) were added to the list.
   */
  | 'add'

  /**
   * Item(s) were removed from the list.
   */
  | 'remove';

/**
 * The changed object which is emitted by a list.
 */
export interface IListChange<T = any> {
  /**
   * The type of change undergone by the vector.
   */
  type: ListChangeType;

  /**
   * The new index associated with the change.
   */
  newIndex: number;

  /**
   * The new values associated with the change.
   *
   * #### Notes
   * The values will be contiguous starting at the `newIndex`.
   */
  newValues: T[];

  /**
   * The old index associated with the change.
   */
  oldIndex: number;

  /**
   * The old values associated with the change.
   *
   * #### Notes
   * The values will be contiguous starting at the `oldIndex`.
   */
  oldValues: T[];
}

/**
 * The change types which occur on an observable map.
 */
export type MapChangeType =
  /**
   * An entry was added.
   */
  | 'add'

  /**
   * An entry was removed.
   */
  | 'remove'

  /**
   * An entry was changed.
   */
  | 'change';

/**
 * The changed args object which is emitted by an observable map.
 */
export interface IMapChange<T = any> {
  /**
   * The type of change undergone by the map.
   */
  type: MapChangeType;

  /**
   * The key of the change.
   */
  key: string;

  /**
   * The old value of the change.
   */
  oldValue?: T;

  /**
   * The new value of the change.
   */
  newValue?: T;
}

/**
 * Text source change
 */
export type SourceChange = {
  /**
   * Text source change
   */
  sourceChange?: Delta<string>;
};

/**
 * Definition of the shared Notebook changes.
 */
export type NotebookChange = DocumentChange & {
  /**
   * Cell changes
   */
  cellsChange?: Delta<ISharedCell[]>;
  /**
   * Notebook metadata changes
   */
  metadataChange?: {
    oldValue: INotebookMetadata;
    newValue?: INotebookMetadata;
  };
  /**
   * nbformat version change
   */
  nbformatChanged?: {
    key: string;
    oldValue?: number;
    newValue?: number;
  };
};

/**
 * File change
 */
export type FileChange = DocumentChange & SourceChange;

/**
 * Definition of the shared Cell changes.
 */
export type CellChange<MetadataType extends IBaseCellMetadata = IBaseCellMetadata> =
  SourceChange & {
    /**
     * Cell attachment change
     */
    attachmentsChange?: {
      oldValue?: IAttachments;
      newValue?: IAttachments;
    };
    /**
     * Cell output changes
     */
    outputsChange?: Delta<IOutput[]>;
    /**
     * Cell execution count change
     */
    executionCountChange?: {
      oldValue?: number;
      newValue?: number;
    };
    /**
     * Cell metadata change
     */
    metadataChange?: {
      oldValue?: Partial<MetadataType>;
      newValue?: Partial<MetadataType>;
    };
  };
