import { SimpleWorkerServer } from '@difizen/monaco-editor-core/esm/vs/base/common/worker/simpleWorker.js';
import { EditorSimpleWorker } from '@difizen/monaco-editor-core/esm/vs/editor/common/services/editorSimpleWorker.js';

let initialized = false;
export function initialize(foreignModule: any) {
  if (initialized) {
    return;
  }
  initialized = true;
  const simpleWorker = new SimpleWorkerServer(
    (msg: string) => {
      globalThis.postMessage(msg);
    },
    (host: string) => new EditorSimpleWorker(host, foreignModule),
  );
  globalThis.onmessage = (e) => {
    simpleWorker.onmessage(e.data);
  };
}
globalThis.onmessage = (e) => {
  // Ignore first message in this case and initialize if not yet initialized
  if (!initialized) {
    initialize(null);
  }
};
