import { LoadingOutlined } from '@ant-design/icons';
import type { CellView } from '@difizen/libro-core';
import {
  ExecutableCellView,
  CheckCircleOutlined,
  ExecutableCellModel,
} from '@difizen/libro-core';
import { useObserve } from '@difizen/libro-common/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import classnames from 'classnames';
import moment from 'moment';
import { useState } from 'react';

import type { JupyterCodeCellModel } from '../cell/jupyter-code-cell-model.js';
import {
  formatTime,
  parseExecutionInfoFromModel,
  isWaitingExecute,
} from '../utils/index.js';

import { InfoCircle } from './icons.js';

import './index.less';

export function CellExecutionTip({ cell }: { cell: CellView }) {
  const [, setCurrentTime] = useState<number>();
  const observableCell = useObserve(cell);

  if (!ExecutableCellView.is(observableCell)) {
    return null;
  }

  if (!ExecutableCellModel.is(observableCell.model)) {
    return null;
  }

  const isHidden = observableCell.model.hasOutputHidden;
  const kernelExecuting = (cell.model as unknown as JupyterCodeCellModel)
    .kernelExecuting;
  const executionInfo = parseExecutionInfoFromModel(cell.model);

  const output = observableCell.outputArea.outputs;
  const existOutput = output && output.length !== 0;

  const waitingExecute = isWaitingExecute(observableCell.model);

  if (!executionInfo) {
    return null;
  }

  const { executeStartTime, executeFinishTime } = executionInfo;
  if (executeStartTime && executeFinishTime && observableCell.model.executeCount) {
    return isHidden ? (
      <div className="libro-cell-execution-tip-hide-output">
        <div className="libro-cell-execution-tip-border" />
        <CheckCircleOutlined />
      </div>
    ) : (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <CheckCircleOutlined />
        <p>
          {l10n.t(
            '执行耗时 {0}，结束于 {1}',
            formatTime(
              Number(new Date(executeFinishTime).getTime()) -
                Number(new Date(executeStartTime).getTime()),
            ),
            moment(new Date(executeFinishTime).getTime()).format('hh:mm a'),
          )}
        </p>
      </div>
    );
  } else if (kernelExecuting) {
    setTimeout(() => {
      setCurrentTime(Date.now());
    }, 100);
    return (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <LoadingOutlined style={{ color: 'rgba(24,144,255,1)' }} />
        <p>
          {l10n.t(
            '已过去 {0}',
            formatTime(Date.now() - Number(new Date(executeStartTime).getTime())),
          )}
        </p>
      </div>
    );
  } else if (waitingExecute) {
    return (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <InfoCircle />
        <p>{l10n.t('待执行')}</p>
      </div>
    );
  }
  return null;
}
