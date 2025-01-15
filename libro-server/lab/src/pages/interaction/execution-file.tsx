import {
  BaseView,
  ViewInstance,
  prop,
  singleton,
  useInject,
  view,
} from '@difizen/mana-app';
import React, { forwardRef, useEffect } from 'react';
import qs from 'query-string';

export const LibroExecutionFileComponent = forwardRef<HTMLDivElement>(
  function LibroExecutionFileComponent(props, ref) {
    const queryParams = qs.parse(window.location.search);
    const instance = useInject<LibroExecutionFileView>(ViewInstance);
    const filePath = queryParams['path'];
    useEffect(() => {
      if (filePath && typeof filePath === 'string') {
        instance.path = filePath;
      }
    }, [filePath]);
    if (!queryParams['path']) {
      return null;
    }
    return (
      <div className="libro-execution-file" ref={ref}>
        <h2>{instance.path}</h2>
      </div>
    );
  },
);

@singleton()
@view('libro-execution-file')
export class LibroExecutionFileView extends BaseView {
  override view = LibroExecutionFileComponent;

  @prop() protected _path: string;

  get path(): string {
    return this._path;
  }
  set path(v: string) {
    this._path = v;
  }
}
