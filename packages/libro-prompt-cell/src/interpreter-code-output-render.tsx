import type { BaseOutputView } from '@difizen/libro-jupyter';
import React from 'react';

import { CodeBlock } from './code-block.js';
import { LibroPromptCellView } from './prompt-cell-view.js';

export const InterpreterCodeOutputRender: React.FC<{
  model: BaseOutputView;
}> = (props: { model: BaseOutputView }) => {
  const { model } = props;
  if (!model.data['application/vnd.libro.interpreter.code+text']) {
    return null;
  }
  if (!(model.cell instanceof LibroPromptCellView)) {
    return null;
  }

  const data = model.data['application/vnd.libro.interpreter.code+text'] as string;
  model.cell.model.interpreterCode = data;

  return (
    <div className="libro-interpreter-code-output-render-container">
      <div className="libro-interpreter-code-output-render">
        <CodeBlock className="language-python" value={data} />
      </div>
    </div>
  );
};
