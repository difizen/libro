import type { IEditorMimeTypeService } from '@difizen/libro-code-editor';
import { defaultMimeType } from '@difizen/libro-code-editor';
import type { ILanguageInfoMetadata } from '@difizen/libro-common';

import { findBest, findByFileName } from './mode.js';

const extname = (path: string) => {
  return path.split('.').pop();
};

/**
 * The mime type service for CodeMirror.
 */
export class CodeMirrorMimeTypeService implements IEditorMimeTypeService {
  /**
   * Returns a mime type for the given language info.
   *
   * #### Notes
   * If a mime type cannot be found returns the default mime type `text/plain`, never `null`.
   */
  getMimeTypeByLanguage(info: ILanguageInfoMetadata): string {
    const ext = info.file_extension || '';
    const mode = findBest(
      (info.codemirror_mode as any) || {
        mimetype: info.mimetype,
        name: info.name,
        ext: [ext.split('.').slice(-1)[0]],
      },
    );
    return mode ? (mode.mime as string) : defaultMimeType;
  }

  /**
   * Returns a mime type for the given file path.
   *
   * #### Notes
   * If a mime type cannot be found returns the default mime type `text/plain`, never `null`.
   */
  getMimeTypeByFilePath(path: string): string {
    const ext = extname(path);
    if (ext === '.ipy') {
      return 'text/x-python';
    } else if (ext === '.md') {
      return 'text/x-ipythongfm';
    }
    const mode = findByFileName(path) || findBest('');
    return mode ? (mode.mime as string) : defaultMimeType;
  }
}
