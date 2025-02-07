import type { MultilineString, PartialJSONObject } from '@difizen/libro-common';
import { copy2clipboard } from '@difizen/libro-common';
import { concatMultilineString } from '@difizen/libro-common';
import type { BaseOutputView } from '@difizen/libro-jupyter';
import { NotebookCommands } from '@difizen/libro-jupyter';
import { ChatComponents } from '@difizen/magent-chat';
import { CommandRegistry, useInject } from '@difizen/libro-common/app';
import { l10n } from '@difizen/libro-common/l10n';
import React, { useState } from 'react';
import breaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { v4 } from 'uuid';

import { CodeBlock } from './code-block.js';
import { getPythonCode } from './prompt-cell-utils.js';
import { LibroPromptCellView } from './prompt-cell-view.js';

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
  const LLMRender = ChatComponents.Markdown;
  const [selection, setSelection] = useState('');

  if (!model.data['application/vnd.libro.prompt+json']) {
    return null;
  }

  if (!(model.cell instanceof LibroPromptCellView)) {
    return null;
  }
  const data = model.data['application/vnd.libro.prompt+json'] as
    | PartialJSONObject
    | MultilineString;

  if (!data) {
    return null;
  }

  const modelData = getModelOutput(data);
  model.cell.model.promptOutput = modelData;
  const sourceArr = getPythonCode(modelData ?? '');
  const insertAndRun = async () => {
    const libro = model.cell.parent;
    const insertIndex = libro.model.cells.findIndex((c) => c.id === model.cell.id);

    await libro.addCell(
      {
        id: v4(),
        cell: {
          cell_type: 'code',
          source: concatMultilineString(sourceArr),
          metadata: {},
        },
      },
      insertIndex + 1,
    );
    setTimeout(() => {
      commandRegistry.executeCommand(
        NotebookCommands['RunCell'].id,
        libro.model.cells[insertIndex + 1],
        libro,
      );
    });
  };
  const insert = async () => {
    const libro = model.cell.parent;
    const insertIndex = libro.model.cells.findIndex((c) => c.id === model.cell.id);
    await Promise.all(
      sourceArr.map(async (value, index) => {
        await libro.addCell(
          {
            id: v4(),
            cell: { cell_type: 'code', source: value, metadata: {} },
          },
          insertIndex + index + 1,
        );
      }),
    );
  };

  const copy = async () => {
    copy2clipboard(concatMultilineString(sourceArr));
  };

  const copySelection = async () => {
    copy2clipboard(selection);
  };

  const updateSelection = () => {
    const tmpSelection = document.getSelection()?.toString();
    setSelection(tmpSelection || '');
  };

  return (
    <div className="libro-prompt-output-render-container" onMouseUp={updateSelection}>
      <div className="prompt-output-render" ref={renderHTMLRef}>
        <div className="libro-prompt-output-llm-render">
          <LLMRender
            type="message"
            components={{ code: CodeBlock }}
            remarkPlugins={[remarkGfm, breaks]}
          >
            {modelData}
          </LLMRender>
        </div>
      </div>
      {sourceArr.length > 0 && (
        <>
          <span onClick={insertAndRun} className="libro-prompt-output-btn">
            {l10n.t('插入并运行')}
          </span>
          <span onClick={insert} className="libro-prompt-output-btn">
            {l10n.t('插入代码')}
          </span>
          <span onClick={copy} className="libro-prompt-output-btn">
            {l10n.t('复制代码')}
          </span>
        </>
      )}
      {selection && (
        <span onClick={copySelection} className="libro-prompt-output-btn">
          {l10n.t('复制选中内容')}
        </span>
      )}
    </div>
  );
};
