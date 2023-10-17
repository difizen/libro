import type { IKernelModel } from '../kernel/libro-kernel-protocol.js';
import type { LibroKernel } from '../kernel/libro-kernel.js';

import type { LibroSession } from './libro-session.js';

export interface NotebookInSession {
  name: string;
  path: string;
}

export interface SessionMeta {
  id: SessionId;
  name: string;

  type: string;

  path: string;

  kernel: LibroKernel;

  notebook: NotebookInSession;
}

export const SessionMetaOption = Symbol('SessionMetaOption');

export const SessionId = Symbol('LibroSessionId');
export type SessionId = string;

export const LibroSessionFactory = Symbol('LibroSessionFactory');
export type LibroSessionFactory = (session: SessionMeta) => LibroSession;

/**
 * The session model returned by the server.
 *
 * #### Notes
 * See the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions).
 */
export interface SessionIModel {
  /**
   * The unique identifier for the session client.
   */
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly type: string;
  readonly kernel: IKernelModel | null;
}

/**
 * A session request.
 *
 * #### Notes
 * The `path` and `type` session model parameters are required. The `name`
 * parameter is not technically required, but is often assumed to be nonempty,
 * so we require it too.
 *
 * See the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/sessions).
 */
export type ISessionOptions = Pick<SessionIModel, 'path' | 'type' | 'name'> & {
  kernel?: Partial<Pick<IKernelModel, 'name'>>;
};
