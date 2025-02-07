import type { BaseOutputView } from '@difizen/libro-jupyter';
import { RenderMimeContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/libro-common/app';

import { InterpreterCodeOutputRender } from './interpreter-code-output-render.js';

@singleton({ contrib: RenderMimeContribution })
export class LibroInterpreterCodeOutputMimeTypeContribution
  implements RenderMimeContribution
{
  canHandle = (model: BaseOutputView) => {
    return 200;
  };
  renderType = 'interpreterCodeOutputRender';
  safe = true;
  mimeTypes = ['application/vnd.libro.interpreter.code+text'];
  render = InterpreterCodeOutputRender;
}
