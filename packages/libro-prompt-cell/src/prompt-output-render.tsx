import type {
  IMimeBundle,
  MultilineString,
  PartialJSONObject,
} from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-jupyter';
import { NotebookCommands } from '@difizen/libro-jupyter';
import { CommandRegistry, useInject } from '@difizen/mana-app';
import React from 'react';
import { v4 } from 'uuid';

import { LibroLLMRenderMemo } from './libro-llm-render.js';
import { getPythonCode } from './prompt-cell-utils.js';

const getModelOutput = (data: PartialJSONObject | MultilineString) => {
  if (typeof data === 'string' || Array.isArray(data)) {
    return concatMultilineString(data);
  } else {
    return JSON.stringify(data);
  }
};

export const PromptOutputRender: React.FC<{
  model: BaseOutputView;
}> = (props: { model: BaseOutputView }) => {
  const { model } = props;
  const renderHTMLRef = React.createRef<HTMLDivElement>();
  const commandRegistry = useInject(CommandRegistry);

  if (!model.data['application/vnd.libro.prompt+json']) {
    return null;
  }

  const { data } = model.data['application/vnd.libro.prompt+json'] as IMimeBundle;

  if (!data) {
    return null;
  }
  const modelData = getModelOutput(data);
  const sourceArr = getPythonCode(modelData ?? '');
  const handleOutput = async () => {
    const libro = model.cell.parent;
    const insertIndex = libro.model.cells.findIndex((c) => c.id === model.cell.id);

    await Promise.all(
      sourceArr.map(async (value, index) => {
        const newView = await libro.addCell(
          {
            id: v4(),
            cell: { cell_type: 'code', source: value, metadata: {} },
          },
          insertIndex + index + 1,
        );
        return newView;
      }),
    );

    await Promise.all(
      sourceArr.map(async (_, index) => {
        await commandRegistry.executeCommand(
          NotebookCommands['RunCell'].id,
          libro.model.cells[insertIndex + index + 1],
          libro,
        );
      }),
    );
  };
  return (
    <div className="libro-prompt-output-render-container">
      <div className="prompt-output-render" ref={renderHTMLRef}>
        <div className="libro-prompt-output-llm-render">
          <LibroLLMRenderMemo data={modelData} />
        </div>
      </div>
      {sourceArr.length > 0 && (
        <span onClick={handleOutput} className="libro-prompt-output-btn">
          插入并运行
        </span>
      )}
    </div>
  );
};
